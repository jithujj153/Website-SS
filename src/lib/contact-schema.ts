import { z } from "zod";
import { interestOptions } from "@/config/content";

const interestValues = interestOptions.map((o) => o.value) as [string, ...string[]];

/** Shared by the browser form (instant feedback) and the API route (the real check). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[+()\d\s-]*$/, "Use digits, spaces, + ( ) or - only.")
    .optional()
    .or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  interest: z.enum(interestValues, { errorMap: () => ({ message: "Please choose what you are interested in." }) }),
  message: z.string().trim().min(10, "A few more words please (at least 10 characters).").max(4000, "That is a bit long. Please keep it under 4000 characters."),
  /** honeypot: real users never see or fill this */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
