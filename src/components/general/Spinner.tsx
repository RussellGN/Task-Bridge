type SpinnerProps = {
   size?: "sm" | "md" | "lg";
   color?: string;
};

export default function Spinner({ size = "md", color = "grey" }: SpinnerProps) {
   return (
      <div
         className={`spinner-border mr-2 inline-block animate-spin rounded-full border-2 border-t-transparent ${
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8"
         }`}
         style={{ borderColor: `${color} transparent transparent transparent` }}
      ></div>
   );
}
