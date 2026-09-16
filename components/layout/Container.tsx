import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ContainerOwnProps<E extends ElementType> = {
  as?: E | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

export type ContainerProps<E extends ElementType = "div"> = ContainerOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ContainerOwnProps<E>>;

/**
 * Max-width + responsive gutters shell (technical-plan.md §B S04.02, Design.md §2 container/
 * gutter tokens). Polymorphic `as` mirrors `ClayCard`'s pattern so any section can render the
 * container as its own root element (`section`, `header`, …) without an extra wrapping `div`.
 */
const baseClass =
  "mx-auto w-full max-w-[var(--container-max)] 2xl:max-w-[var(--container-max-wide)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]";

export function Container<E extends ElementType = "div">(props: ContainerProps<E>) {
  const { as, className, children, ...rest } = props;
  const Component = (as ?? "div") as ElementType;
  const classes = [baseClass, className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
