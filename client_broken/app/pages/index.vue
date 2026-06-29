<script setup lang="ts">
import CatalogPreviewSection from '~/components/landing/CatalogPreviewSection.vue'
import CtaSection from '~/components/landing/CtaSection.vue'
import DigitalReadingSection from '~/components/landing/DigitalReadingSection.vue'
import FeatureCardsSection from '~/components/landing/FeatureCardsSection.vue'
import HeroSection from '~/components/landing/HeroSection.vue'
import HowItWorksSection from '~/components/landing/HowItWorksSection.vue'
import LandingBackground from '~/components/landing/LandingBackground.vue'
import RoleSection from '~/components/landing/RoleSection.vue'
import StatsSection from '~/components/landing/StatsSection.vue'
</script>

<template>
  <div class="relative isolate overflow-hidden">
    <LandingBackground />
    <HeroSection />
    <CatalogPreviewSection />
    <FeatureCardsSection />
    <HowItWorksSection />
    <DigitalReadingSection />
    <RoleSection />
    <StatsSection />
    <CtaSection />
  </div>
</template>
