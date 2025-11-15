-- Create table for hospital visits
CREATE TABLE public.hospital_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  travel_time INTEGER NOT NULL,
  wait_time INTEGER NOT NULL,
  total_estimated_time INTEGER NOT NULL,
  visit_start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for feedback
CREATE TABLE public.visit_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID NOT NULL REFERENCES public.hospital_visits(id) ON DELETE CASCADE,
  wait_time_accurate BOOLEAN,
  actual_wait_time INTEGER,
  visit_completed BOOLEAN NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can insert hospital visits" 
ON public.hospital_visits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own visits" 
ON public.hospital_visits 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert feedback" 
ON public.visit_feedback 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view feedback" 
ON public.visit_feedback 
FOR SELECT 
USING (true);