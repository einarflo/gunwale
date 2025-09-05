import { createApp } from './app';

const app = createApp();

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`Mothership listening on ${port}`);
});
