"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Import Lottie dynamically with SSR disabled to prevent hydration errors and freeze bugs
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type LottieProps = ComponentProps<typeof Lottie>;

export default function LottieClient(props: any) {
  return <Lottie {...props} />;
}
