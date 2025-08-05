import { LucideIcon } from "lucide-react";
import MenuBarItem from "./MenuBarItem";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

type MenuBarLinkItemProps = {
   to: string;
   children: React.ReactNode;
   Icon?: LucideIcon;
   disabled?: boolean;
   className?: string;
   containerClassName?: string;
   iconClassName?: string;
};

export default function MenuBarLinkItem({
   to,
   Icon,
   children,
   disabled,
   className,
   containerClassName,
   iconClassName,
}: MenuBarLinkItemProps) {
   return (
      <MenuBarItem
         asChild
         disabled={disabled}
         className={cn("cursor-pointer py-0.5 hover:bg-black", containerClassName)}
      >
         <Link
            to={disabled ? "" : to}
            className={cn(
               "flex items-center gap-1.5 text-sm text-white",
               disabled && "cursor-not-allowed opacity-50",

               className,
            )}
         >
            {children}
            {Icon && <Icon className={cn("lucide-exempt mt-0.5 size-3.5", iconClassName)} />}
         </Link>
      </MenuBarItem>
   );
}
