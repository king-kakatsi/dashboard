
const express = require("express");
const app = express();
const PORT = 8080;

app.get("/about.json", (req, res) => {
  const aboutData = {
    ...abouts,
    server: {
      ...abouts.server,
      current_time: Math.floor(Date.now() / 1000)
    },
    client: {
      host: req.ip || "0.0.0.0" 
    }
  };

  res.json(aboutData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
