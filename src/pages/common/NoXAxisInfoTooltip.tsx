import { TooltipProps } from "recharts";
// @ts-expect-error: explanation here
import { DefaultTooltipContent } from "recharts/lib/component/DefaultTooltipContent";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export function NoXAxisInfoTooltip(props: TooltipProps<ValueType, NameType>) {
  if (props.payload != null) {
    return <DefaultTooltipContent {...props} label={null} />;
  }
  return <DefaultTooltipContent {...props} />;
};
