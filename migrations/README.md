# Database Migrations

This directory contains SQL migration scripts for the OptiPrompt database schema.

## Directory Structure

- `/applied`: Contains migrations that have been applied to the database
  - `/2025-07-08-initial-schema`: Initial database schema setup with tables for prompt templates, variables, user interactions, and social features
- `/pending`: Contains migrations that are ready to be applied but haven't been run yet

## Applied Migrations

### 2025-07-08 Initial Schema

These migrations create the core database schema for the OptiPrompt application:

1. `create_template_variables.sql`: Stores variables extracted from templates with questions and defaults
2. `create_user_variable_values.sql`: Stores user-specific default values for personalized autofill
3. `create_engagements.sql`: Tracks aggregate metrics (likes, saves, shares, views, copies)
4. `create_user_interactions.sql`: Tracks individual user interactions with templates
5. `create_followers.sql`: Implements user following/follower relationships
6. `create_notifications.sql`: Stores notifications for social interactions
7. `create_template_media.sql`: Support for future media attachments

## How to Apply Migrations

Migrations should be applied in the order they are numbered. To apply a migration:

1. Log into your Supabase dashboard
2. Go to the SQL Editor section
3. Create a new query
4. Copy and paste the SQL file contents
5. Run the script and verify that it executes successfully

## Creating New Migrations

When creating new migrations:

1. Create a new dated folder under `/pending` (e.g., `/pending/2025-07-15-user-preferences`)
2. Add your SQL migration files with descriptive names
3. After applying the migrations, move the folder from `/pending` to `/applied`

## Current Database Schema (as of 2025-07-08)

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.block_variables (
  block_id uuid NOT NULL,
  variable_id uuid NOT NULL,
  CONSTRAINT block_variables_pkey PRIMARY KEY (block_id, variable_id),
  CONSTRAINT block_variables_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.prompt_blocks(id),
  CONSTRAINT block_variables_variable_id_fkey FOREIGN KEY (variable_id) REFERENCES public.variables(id)
);
CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL,
  template_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookmarks_pkey PRIMARY KEY (user_id, template_id),
  CONSTRAINT bookmarks_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id),
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.copy_events_daily (
  template_id uuid NOT NULL,
  day date NOT NULL,
  copies_int integer DEFAULT 0,
  CONSTRAINT copy_events_daily_pkey PRIMARY KEY (template_id, day),
  CONSTRAINT copy_events_daily_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id)
);
CREATE TABLE public.engagements (
  template_id uuid NOT NULL,
  likes_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  copies_count integer DEFAULT 0,
  CONSTRAINT engagements_pkey PRIMARY KEY (template_id),
  CONSTRAINT engagements_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id)
);
CREATE TABLE public.followers (
  follower_id uuid,
  following_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT followers_pkey PRIMARY KEY (id),
  CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id),
  CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  user_id uuid,
  actor_id uuid,
  type text NOT NULL,
  template_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id),
  CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  username text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  social_links jsonb DEFAULT '{}'::jsonb,
  bio text DEFAULT ''::text,
  id uuid NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.prompt_blocks (
  template_id uuid NOT NULL,
  position integer NOT NULL,
  title text,
  code text,
  language text,
  deleted_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prompt_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT prompt_blocks_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id)
);
CREATE TABLE public.prompt_templates (
  content text,
  author_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  body_md text,
  published_at timestamp with time zone,
  deleted_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text])),
  visibility text NOT NULL DEFAULT 'public'::text CHECK (visibility = ANY (ARRAY['public'::text, 'unlisted'::text, 'private'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prompt_templates_pkey PRIMARY KEY (id),
  CONSTRAINT prompt_templates_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tags (
  icon text,
  tagline text,
  icon_weight text,
  name text NOT NULL UNIQUE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.template_media (
  template_id uuid,
  storage_path text NOT NULL,
  media_type text NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT template_media_pkey PRIMARY KEY (id),
  CONSTRAINT template_media_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id)
);
CREATE TABLE public.template_tags (
  template_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT template_tags_pkey PRIMARY KEY (template_id, tag_id),
  CONSTRAINT template_tags_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id),
  CONSTRAINT template_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.template_variables (
  template_id uuid,
  name text NOT NULL,
  question text NOT NULL,
  default_value text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT template_variables_pkey PRIMARY KEY (id),
  CONSTRAINT template_variables_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id)
);
CREATE TABLE public.user_interactions (
  user_id uuid,
  template_id uuid,
  last_viewed_at timestamp with time zone,
  last_copied_at timestamp with time zone,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  liked boolean DEFAULT false,
  saved boolean DEFAULT false,
  shared boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_interactions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id),
  CONSTRAINT user_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_variable_values (
  user_id uuid,
  variable_name text NOT NULL,
  value text NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_variable_values_pkey PRIMARY KEY (id),
  CONSTRAINT user_variable_values_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.variables (
  author_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT variables_pkey PRIMARY KEY (id),
  CONSTRAINT variables_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.views_daily (
  template_id uuid NOT NULL,
  day date NOT NULL,
  views_int integer DEFAULT 0,
  CONSTRAINT views_daily_pkey PRIMARY KEY (template_id, day),
  CONSTRAINT views_daily_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.prompt_templates(id)
);
```
