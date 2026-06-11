import { ContainerScroll } from "@repo/ui";
import Image from "next/image";

export function HeroScrollDashboard() {

  return (
    <div className="w-full hidden md:block md:relative overflow-visible -mt-16 md:-mt-20 z-20">      
      <ContainerScroll titleComponent="">
        <Image 
           src="/dashboard.png"
           alt="Rescomail Dashboard" 
           className="w-full h-full object-fill rounded-sm"
           width={1920}
           height={1080}
        />
      </ContainerScroll>
    </div>
  );
}
