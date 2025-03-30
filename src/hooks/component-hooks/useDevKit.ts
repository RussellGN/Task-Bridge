import { useState } from "react";

export default function useDevKit() {
   const [isExpanded, setIsExpanded] = useState(false);

   return { isExpanded, setIsExpanded };
}
