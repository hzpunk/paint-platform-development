import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { HitsCarousel } from "@/components/home/hits-carousel";
import { Advantages } from "@/components/home/advantages";
import { ColorMixingCta } from "@/components/home/colormixing-cta";
import { LoyaltyBlock } from "@/components/home/loyalty-block";
import ReviewsBlock from "@/components/home/reviews-block";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <HitsCarousel />
      <Advantages />
      <ColorMixingCta />
      <LoyaltyBlock />
      <ReviewsBlock />
    </>
  );
}
