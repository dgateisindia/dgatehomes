import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroCinematic from '../components/home/HeroCinematic';
import FeaturedPropertiesScroll from '../components/home/FeaturedPropertiesScroll';
import PropertyCategoriesCinematic from '../components/home/PropertyCategoriesCinematic';
import WhyDgateCinematic from '../components/home/WhyDgateCinematic';
import FeaturedLocationsCinematic from '../components/home/FeaturedLocationsCinematic';
import InvestmentJvSection from '../components/home/InvestmentJvSection';
import FinalCtaCinematic from '../components/home/FinalCtaCinematic';
import EnquiryModal from '../components/common/EnquiryModal';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { buildPropertiesUrl } from '../utils/queryHelper';
import { resolvePropertyTypeId } from '../config/propertyTypes';

export default function HomePage({ enquiryModalOpen, setEnquiryModalOpen }) {
  const navigate = useNavigate();
  const [selectedPropertyForEnquiry, setSelectedPropertyForEnquiry] = useState(null);

  // Initialize Lenis smooth scrolling synced with GSAP ScrollTrigger
  useSmoothScroll(true);

  const handleOpenEnquiry = (property = null) => {
    setSelectedPropertyForEnquiry(property);
    setEnquiryModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    setEnquiryModalOpen(false);
    setSelectedPropertyForEnquiry(null);
  };

  const handleSearch = (searchFilters) => {
    navigate(buildPropertiesUrl(searchFilters));
  };

  const handleSelectCategory = (categoryTitle, propertyTypeId) => {
    const typeId = propertyTypeId || resolvePropertyTypeId(categoryTitle);
    navigate(buildPropertiesUrl({ property_type_id: typeId || undefined, listing_type: 'sale' }));
  };

  const handleSelectLocation = (locationName) => {
    navigate(buildPropertiesUrl({ location: locationName, listing_type: 'sale' }));
  };

  return (
    <div className="home-page-cinematic" style={{ overflowX: 'hidden' }}>
      {/* 1 & 2. Full-Screen Cinematic Hero & Compact Search Bar */}
      <HeroCinematic onSearch={handleSearch} />

      {/* 3. Featured Properties (Pinned Horizontal Scroll Scrub) */}
      <FeaturedPropertiesScroll
        onSelectProperty={(property) => {
          if (property?.slug || property?.id) {
            navigate(`/properties/${property.slug || property.id}`, {
              state: { property, openEnquiry: true },
            });
          }
        }}
        onOpenEnquiry={(property) => {
          if (property?.slug || property?.id) {
            navigate(`/properties/${property.slug || property.id}`, {
              state: { property, openEnquiry: true },
            });
          }
        }}
      />

      {/* 4. Property Categories (Staggered Card Reveal & Scale) */}
      <PropertyCategoriesCinematic onSelectCategory={handleSelectCategory} />

      {/* 5. Why Dgate Homes (Animated Counters & Line-by-Line Reveals) */}
      <WhyDgateCinematic />

      {/* 6. Featured Locations (Full-Width Visuals & Parallax Backgrounds) */}
      <FeaturedLocationsCinematic onSelectLocation={handleSelectLocation} />

      {/* 7. Investment / JV Section (Split-Screen Sticky Layout) */}
      <InvestmentJvSection onOpenEnquiry={handleOpenEnquiry} />

      {/* 8. Final CTA (Minimal Panoramic Luxury Banner) */}
      <FinalCtaCinematic onOpenEnquiry={() => handleOpenEnquiry(null)} />

      {/* Global Lead Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={handleCloseEnquiry}
        property={selectedPropertyForEnquiry}
      />
    </div>
  );
}
