import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { HitsCarousel } from "@/components/home/hits-carousel";
import { Advantages } from "@/components/home/advantages";
import { ColorMixingCta } from "@/components/home/colormixing-cta";
import { LoyaltyBlock } from "@/components/home/loyalty-block";
import ReviewsBlock from "@/components/home/reviews-block";

/**
 * Главная страница платформы
 * Загружает данные с сервера через API в компонентах
 */
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
