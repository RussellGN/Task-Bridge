import * as React from "react";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";

const MenuBarItem = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button> & { Icon?: LucideIcon }>(
   ({ children, Icon, ...props }, ref) => {
      return (
         <Button ref={ref} variant="menuBarItem" size="menuBarItem" {...props}>
            <span className="flex items-center gap-2">
               {Icon && <Icon className="lucide-exempt size-4" />}
               {children}
            </span>
         </Button>
      );
   },
);

MenuBarItem.displayName = "MenuBarItem";

export default MenuBarItem;
