import mongoose from 'mongoose';

// Standalone catalog seed. Run with: npm run seed
// Requires DATABASE_URL in the environment (see .env.example).

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const connectorSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true, required: true },
    description: String,
    icon: String,
    baseUrl: String,
    userIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

const widgetSchema = new mongoose.Schema(
  {
    userIds: { type: [String], default: [] },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connector',
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    functionName: String,
    icon: String,
    endpoint: String,
    refreshRate: { type: Number, default: 300 },
    positions: { type: Array, default: [] },
  },
  { timestamps: true },
);

const Connector =
  mongoose.models.Connector || mongoose.model('Connector', connectorSchema);
const Widget =
  mongoose.models.Widget || mongoose.model('Widget', widgetSchema);

const CATALOG: Array<{
  connector: Record<string, unknown>;
  widgets: Array<Record<string, unknown>>;
}> = [
  {
    connector: {
      title: 'GitHub',
      description: 'Browse public repositories and starred projects.',
      icon: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
      baseUrl: 'https://api.github.com',
    },
    widgets: [
      {
        name: 'Repositories',
        description: 'List public repositories of a user.',
        functionName: 'listRepos',
        icon: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
        endpoint: '/users/{username}/repos',
        refreshRate: 300,
      },
      {
        name: 'Starred',
        description: 'List starred repositories of a user.',
        functionName: 'listStarred',
        icon: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
        endpoint: '/users/{username}/starred',
        refreshRate: 300,
      },
    ],
  },
  {
    connector: {
      title: 'News',
      description: 'Latest headlines from Google News RSS.',
      icon: 'https://cdn-icons-png.flaticon.com/512/21/21601.png',
      baseUrl: 'https://news.google.com',
    },
    widgets: [
      {
        name: 'Top stories',
        description: 'Top news stories feed.',
        functionName: 'topStories',
        icon: 'https://cdn-icons-png.flaticon.com/512/21/21601.png',
        endpoint: '/rss?hl=en-US&gl=US&ceid=US:en',
        refreshRate: 600,
      },
      {
        name: 'Sports News',
        description: 'Sports headlines with auto-refresh.',
        functionName: 'sportsNews',
        icon: 'https://cdn-icons-png.flaticon.com/512/21/21601.png',
        endpoint: '/rss/search?q=sports&hl=en-US&gl=US&ceid=US:en',
        refreshRate: 600,
      },
    ],
  },
  {
    connector: {
      title: 'Gmail',
      description: 'Recent emails from your Gmail inbox (OAuth required).',
      icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
      baseUrl: 'https://gmail.googleapis.com',
    },
    widgets: [
      {
        name: 'Inbox',
        description: 'Five most recent emails.',
        functionName: 'recentEmails',
        icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
        endpoint: '/gmail/v1/users/me/messages',
        refreshRate: 300,
      },
    ],
  },
  {
    connector: {
      title: 'Weather',
      description: 'Current weather from OpenWeatherMap.',
      icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
      baseUrl: 'https://api.openweathermap.org',
    },
    widgets: [
      {
        name: 'Current weather',
        description: 'Temperature, humidity and wind for a city.',
        functionName: 'currentWeather',
        icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
        endpoint: '/data/2.5/weather',
        refreshRate: 900,
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(DATABASE_URL as string, { dbName: 'dashboard' });

  for (const entry of CATALOG) {
    const connector = await Connector.findOneAndUpdate(
      { title: entry.connector.title },
      { $setOnInsert: entry.connector },
      { upsert: true, new: true },
    );

    for (const widget of entry.widgets) {
      await Widget.findOneAndUpdate(
        { serviceId: connector._id, name: widget.name },
        { $setOnInsert: { ...widget, serviceId: connector._id } },
        { upsert: true },
      );
    }
  }

  const connectorCount = await Connector.countDocuments();
  const widgetCount = await Widget.countDocuments();
  await mongoose.disconnect();

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete: ${connectorCount} connectors, ${widgetCount} widgets.`,
  );
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error.message);
  process.exit(1);
});
