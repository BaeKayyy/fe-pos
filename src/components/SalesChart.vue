<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SalesPoint } from '@/types/dashboard';

const props = defineProps<{
    points: SalesPoint[];
    totalSales: number;
    isLoading?: boolean;
    period: string;
}>();

const emit = defineEmits<{
    (e: 'update:period', val: string): void;
}>();

const activePointIndex = ref<number | null>(null);

const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'This Month', value: 'this_month' }
];

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

// SVG dimensions
const svgWidth = 600;
const svgHeight = 220;
const paddingLeft = 55;
const paddingRight = 20;
const paddingTop = 25;
const paddingBottom = 40;

const chartWidth = svgWidth - paddingLeft - paddingRight;
const chartHeight = svgHeight - paddingTop - paddingBottom;

const maxVal = computed(() => {
    if (!props.points || props.points.length === 0) return 1000000;
    const max = Math.max(...props.points.map((p) => p.total));
    return max > 0 ? max * 1.15 : 1000000;
});

const yTicks = computed(() => {
    const max = maxVal.value;
    return [
        { label: formatShortCurrency(max), y: paddingTop },
        { label: formatShortCurrency(max * 0.66), y: paddingTop + chartHeight * 0.33 },
        { label: formatShortCurrency(max * 0.33), y: paddingTop + chartHeight * 0.66 },
        { label: 'Rp 0', y: paddingTop + chartHeight }
    ];
});

function formatShortCurrency(val: number): string {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}k`;
    return `Rp ${Math.round(val)}`;
}

const computedPoints = computed(() => {
    if (!props.points || props.points.length === 0) return [];
    const count = props.points.length;
    const step = count > 1 ? chartWidth / (count - 1) : 0;

    return props.points.map((p, i) => {
        const x = paddingLeft + (count === 1 ? chartWidth / 2 : i * step);
        const ratio = p.total / maxVal.value;
        const y = paddingTop + chartHeight - ratio * chartHeight;
        return {
            x,
            y,
            date: p.date,
            label: p.label,
            total: p.total
        };
    });
});

// Cubic bezier path string
const linePath = computed(() => {
    const pts = computedPoints.value;
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i];
        const next = pts[i + 1];
        const cp1x = curr.x + (next.x - curr.x) / 2;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) / 2;
        const cp2y = next.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
});

const areaPath = computed(() => {
    const pts = computedPoints.value;
    if (pts.length === 0) return '';
    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    const bottomY = paddingTop + chartHeight;

    return `${linePath.value} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
});
</script>

<template>
    <div class="bg-white p-6 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between h-full">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 mb-4">
            <div>
                <h3 class="text-base font-semibold text-surface-900">Sales Overview</h3>
                <div class="mt-1">
                    <div class="text-2xl font-bold text-surface-900 tracking-tight">
                        {{ formatCurrency(totalSales || 0) }}
                    </div>
                    <div class="text-xs text-surface-500 font-medium">Total sales for period</div>
                </div>
            </div>

            <!-- Select Period -->
            <select
                :value="period"
                @change="emit('update:period', ($event.target as HTMLSelectElement).value)"
                class="text-xs font-medium bg-surface-50 border border-surface-200 text-surface-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
                <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
        </div>

        <!-- SVG Chart -->
        <div class="relative w-full overflow-hidden mt-2">
            <svg
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
                class="w-full h-auto overflow-visible"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
                        <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                    </linearGradient>
                </defs>

                <!-- Y-Grid Lines -->
                <g class="grid-lines">
                    <line
                        v-for="(tick, idx) in yTicks"
                        :key="idx"
                        :x1="paddingLeft"
                        :y1="tick.y"
                        :x2="svgWidth - paddingRight"
                        :y2="tick.y"
                        stroke="#e4e4e7"
                        stroke-dasharray="3 3"
                        stroke-width="1"
                    />
                    <text
                        v-for="(tick, idx) in yTicks"
                        :key="'t-' + idx"
                        :x="paddingLeft - 8"
                        :y="tick.y + 4"
                        text-anchor="end"
                        class="text-[10px] fill-surface-400 font-medium"
                    >
                        {{ tick.label }}
                    </text>
                </g>

                <!-- Area Fill -->
                <path v-if="areaPath" :d="areaPath" fill="url(#emeraldAreaGradient)" />

                <!-- Main Line -->
                <path
                    v-if="linePath"
                    :d="linePath"
                    fill="none"
                    stroke="#10b981"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <!-- Data Points & X-Labels -->
                <g v-for="(pt, idx) in computedPoints" :key="idx" class="group cursor-pointer">
                    <!-- X Label -->
                    <text
                        :x="pt.x"
                        :y="svgHeight - 10"
                        text-anchor="middle"
                        class="text-[11px] fill-surface-500 font-medium"
                    >
                        {{ pt.label }}
                    </text>

                    <!-- Target area for hover -->
                    <circle
                        :cx="pt.x"
                        :cy="pt.y"
                        r="14"
                        fill="transparent"
                        @mouseenter="activePointIndex = idx"
                        @mouseleave="activePointIndex = null"
                    />

                    <!-- Point Dot -->
                    <circle
                        :cx="pt.x"
                        :cy="pt.y"
                        :r="activePointIndex === idx ? 6 : 4"
                        :fill="activePointIndex === idx ? '#10b981' : '#ffffff'"
                        stroke="#10b981"
                        stroke-width="2.5"
                        class="transition-all duration-150"
                    />

                    <!-- Hover Tooltip -->
                    <g v-if="activePointIndex === idx" class="pointer-events-none">
                        <rect
                            :x="Math.min(Math.max(pt.x - 55, 5), svgWidth - 115)"
                            :y="Math.max(pt.y - 45, 5)"
                            width="110"
                            height="34"
                            rx="6"
                            fill="#18181b"
                            class="shadow-md"
                        />
                        <text
                            :x="Math.min(Math.max(pt.x, 60), svgWidth - 60)"
                            :y="Math.max(pt.y - 30, 20)"
                            text-anchor="middle"
                            fill="#ffffff"
                            class="text-[10px] font-semibold"
                        >
                            {{ pt.label }}: {{ formatCurrency(pt.total) }}
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>
