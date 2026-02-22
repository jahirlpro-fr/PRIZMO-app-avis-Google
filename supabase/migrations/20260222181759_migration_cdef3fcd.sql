-- Add logo columns to establishments table
ALTER TABLE establishments 
ADD COLUMN logo_url TEXT,
ADD COLUMN logo_secondary_url TEXT;