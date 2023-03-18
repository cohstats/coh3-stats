import dynamic from "next/dynamic";

/**
 * Because of SSR rendering issues, we need to use dynamic imports for this component
 */
const DynamicTimeAgo = dynamic(() => import("../internal-timeago"), {
  ssr: false,
  // @ts-ignore
  loading: () => "Calculating...",
});

export default DynamicTimeAgo;
