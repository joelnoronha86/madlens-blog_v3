import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
    publishedAt: z.string().optional(),
    coverImage: z.string().optional(),
    author: z.string().default('Researcher-Artist'),
  }),
});

export const collections = {
  posts,
};
