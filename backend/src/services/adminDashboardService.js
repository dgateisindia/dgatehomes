const adminDashboardRepository = require('../repositories/adminDashboardRepository');

/**
 * Gathers aggregate metrics, recent records, and upcoming follow-ups for the Admin Dashboard.
 * Leverages Promise.all for concurrent execution of independent SQL queries.
 *
 * @returns {Promise<{ summary: Object, recentEnquiries: Array, recentProperties: Array, upcomingFollowUps: Array }>}
 */
async function getDashboardSummary() {
  const [propertyMetrics, enquiryMetrics, recentProperties, recentEnquiries, upcomingFollowUps] =
    await Promise.all([
      adminDashboardRepository.getPropertySummaryMetrics(),
      adminDashboardRepository.getEnquirySummaryMetrics(),
      adminDashboardRepository.getRecentProperties(5),
      adminDashboardRepository.getRecentEnquiries(5),
      adminDashboardRepository.getUpcomingFollowUps(5),
    ]);

  const summary = {
    // Property metrics
    totalProperties: propertyMetrics.totalProperties,
    publishedProperties: propertyMetrics.publishedProperties,
    draftProperties: propertyMetrics.draftProperties,
    archivedProperties: propertyMetrics.archivedProperties,
    featuredProperties: propertyMetrics.featuredProperties,
    propertiesPublishedThisMonth: propertyMetrics.propertiesPublishedThisMonth,

    // Enquiry metrics
    totalEnquiries: enquiryMetrics.totalEnquiries,
    newEnquiries: enquiryMetrics.newEnquiries,
    contactedEnquiries: enquiryMetrics.contactedEnquiries,
    inProgressEnquiries: enquiryMetrics.inProgressEnquiries,
    closedEnquiries: enquiryMetrics.closedEnquiries,
    overdueFollowUps: enquiryMetrics.overdueFollowUps,
    enquiriesToday: enquiryMetrics.enquiriesToday,
    enquiriesThisWeek: enquiryMetrics.enquiriesThisWeek,
  };

  return {
    summary,
    recentEnquiries,
    recentProperties,
    upcomingFollowUps,
  };
}

module.exports = {
  getDashboardSummary,
};
