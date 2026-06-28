import { z } from "zod";

export const templateFormSchema = z.object({
  name: z.string().trim().min(1, "Template name is required")
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
