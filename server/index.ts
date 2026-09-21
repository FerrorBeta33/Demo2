import express from 'express';
import { json } from 'body-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(json());

app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.send({ message: 'success', data: posts });
  } catch (error) {
    // If anything goes wrong, log the error.
    // You can later access the log data in the AWS console.
    console.error(error);
    res.status(400).send({ message: 'error', error: error.message });
  }
});

const validatePost = (body: any) => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const authorEmail = typeof body.authorEmail === 'string' ? body.authorEmail.trim() : '';

  if (!title || !content || !authorEmail || !/^\S+@\S+\.\S+$/.test(authorEmail)) {
    return null;
  }

  return { title, content, authorEmail };
};

app.post('/posts', async (req, res) => {
  const postData = validatePost(req.body);
  if (!postData) {
    return res.status(400).send({ message: 'Title, content, and a valid author email are required.' });
  }

  try {
    const createdPost = await prisma.post.create({ data: postData });
    return res.send({ message: 'success', data: createdPost });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: 'Unable to create the post.' });
  }
});

app.put('/posts/:id', async (req, res) => {
  const postData = validatePost(req.body);
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || !postData) {
    return res.status(400).send({ message: 'A valid post ID and complete post details are required.' });
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: postData,
    });
    return res.send({ message: 'success', data: updatedPost });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: 'Unable to update the post.' });
  }
});

app.listen(process.env.PORT, () => {
  console.info(`Api container started. Listening on port ${process.env.PORT}`);
});
