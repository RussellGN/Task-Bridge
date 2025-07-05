import * as React from "react";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MenuBarItem = React.forwardRef<
   HTMLButtonElement,
   React.ComponentProps<typeof Button> & { Icon?: LucideIcon; iconClassName?: string }
>(({ children, Icon, iconClassName, ...props }, ref) => {
   return (
      <Button ref={ref} variant="menuBarItem" size="menuBarItem" {...props}>
         <span className="flex items-center gap-2">
            {Icon && <Icon className={cn("lucide-exempt size-4", iconClassName)} />}
            {children}
         </span>
      </Button>
   );
});

MenuBarItem.displayName = "MenuBarItem";

export default MenuBarItem;
