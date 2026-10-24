import { apiClient } from './apiClient';

/**
 * Service methods for lead and enquiry submissions.
 */
export const enquiryService = {
  /**
   * Submits a public lead enquiry.
   * @param {{ property_id: number, name: string, phone: string, email?: string, message?: string, source?: string }} payload
   * @returns {Promise<{ success: boolean, message: string, data: { enquiryId: number } }>}
   */
  async submitEnquiry(payload) {
    return apiClient('/enquiries', {
      method: 'POST',
      data: payload,
    });
  },
};
