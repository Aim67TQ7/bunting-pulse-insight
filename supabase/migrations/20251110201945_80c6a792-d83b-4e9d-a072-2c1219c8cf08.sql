-- Add admin policies for managing answer sets
CREATE POLICY "Admins can insert answer sets"
  ON public.survey_answer_sets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update answer sets"
  ON public.survey_answer_sets FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete answer sets"
  ON public.survey_answer_sets FOR DELETE
  TO authenticated
  USING (true);

-- Add admin policies for managing answer options
CREATE POLICY "Admins can insert answer options"
  ON public.survey_answer_options FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update answer options"
  ON public.survey_answer_options FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete answer options"
  ON public.survey_answer_options FOR DELETE
  TO authenticated
  USING (true);