import type { Component } from "solid-js";

import { For, createMemo } from "solid-js";

interface Props {
    selected: number | null;
    years: number[];
    onChange: (year: number | null) => void;
}

const YearSelector: Component<Props> = (props) => {
    const selectedIndex = createMemo(() => (props.selected != null ? props.years.indexOf(props.selected) : -1));

    const handleClick = (year: number) => {
        props.onChange(props.selected === year ? null : year);
    };

    return (
        <div class="flex items-center justify-center gap-3 select-none flex-wrap">
            <For each={props.years}>
                {(year, i) => {
                    const distance = createMemo(() => (props.selected != null ? Math.abs(i() - selectedIndex()) : 999));

                    const isSelected = createMemo(() => props.selected === year);
                    const isAdjacent = createMemo(() => distance() === 1);
                    const isNear = createMemo(() => distance() === 2);

                    return (
                        <button
                            onClick={() => handleClick(year)}
                            class="transition-all duration-300 font-display font-bold cursor-pointer focus:outline-none leading-none"
                            classList={{
                                "text-5xl text-text-primary drop-shadow-[0_0_20px_rgba(108,99,255,0.8)]": isSelected(),
                                "text-2xl text-text-secondary hover:text-text-primary": !isSelected() && isAdjacent(),
                                "text-lg text-muted hover:text-text-secondary": !isSelected() && isNear(),
                                "text-sm text-muted/50 hover:text-muted":
                                    !isSelected() && !isAdjacent() && !isNear() && props.selected != null,
                            }}
                        >
                            {year}
                        </button>
                    );
                }}
            </For>

            {props.selected !== null && (
                <button
                    onClick={() => props.onChange(null)}
                    class="ml-2 text-xs text-muted border border-border px-2.5 py-1 rounded-full hover:border-border-strong hover:text-text-secondary transition-colors font-body"
                >
                    reset
                </button>
            )}
        </div>
    );
};

export default YearSelector;
