const { z } = require('zod');

const createReportSchema = z.object({
  report_type: z.enum(['Injured', 'Abandoned', 'Stray', 'Lost', 'Found'], {
    errorMap: () => ({ message: 'Report type must be Injured, Abandoned, Stray, Lost, or Found' }),
  }),
  animal_type: z.string().min(2, 'Animal type is required'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(5, 'Please provide a clear description (at least 5 characters)'),
  animal_condition: z.string().optional().default(''),
  contact_information: z.string().min(3, 'Contact information is required for coordination'),
  urgency: z.enum(['Critical', 'Urgent', 'Normal']).default('Normal'),
  image_url: z.string().optional().default(''),
});

module.exports = {
  createReportSchema,
};

