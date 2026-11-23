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

const updateReportSchema = z.object({
  report_type: z.enum(['Injured', 'Abandoned', 'Stray', 'Lost', 'Found']).optional(),
  animal_type: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  animal_condition: z.string().optional(),
  contact_information: z.string().min(3).optional(),
  urgency: z.enum(['Critical', 'Urgent', 'Normal']).optional(),
  image_url: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['Active', 'In Progress', 'Resolved'], {
    errorMap: () => ({ message: "Status must be 'Active', 'In Progress', or 'Resolved'" }),
  }),
});

const createTimelineUpdateSchema = z.object({
  event_type: z.string().min(2, 'Event type is required (e.g. Animal Picked Up, Under Treatment)'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
});

const createHelpOfferSchema = z.object({
  help_type: z.enum(['Rescue', 'Transportation', 'Temporary Shelter', 'Veterinary Help', 'Financial Help'], {
    errorMap: () => ({ message: 'Please select a valid help category' }),
  }),
  message: z.string().optional().default(''),
});

const updateOfferStatusSchema = z.object({
  status: z.enum(['Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled'], {
    errorMap: () => ({ message: 'Invalid offer status' }),
  }),
});

module.exports = {
  createReportSchema,
  updateReportSchema,
  updateStatusSchema,
  createTimelineUpdateSchema,
  createHelpOfferSchema,
  updateOfferStatusSchema,
};


