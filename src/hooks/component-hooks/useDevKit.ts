import { useState } from "react";

export default function useDevKit() {
   const [isExpanded, setIsExpanded] = useState(false);
   const [loading, setLoading] = useState(false);

   return { isExpanded, loading, experimental: {}, setIsExpanded };
}
