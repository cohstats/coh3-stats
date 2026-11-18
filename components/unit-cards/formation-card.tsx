import { ReactElement, useState } from "react";
import { Box, ColorSwatch, Group, Select, Slider, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import type {
  FormationPreviewElement,
  FormationPreviewLayout,
  FormationPreviewPoint,
  SquadFormationPreview,
} from "../../src/unitStats/formationPreview";

const ELEMENTS: Array<{
  element: FormationPreviewElement;
  labelKey: string;
  color: string;
}> = [
  { element: "crew", labelKey: "crew", color: "var(--mantine-color-yellow-6)" },
  { element: "core", labelKey: "core", color: "var(--mantine-color-blue-6)" },
  { element: "scout", labelKey: "scout", color: "var(--mantine-color-grape-6)" },
  { element: "left", labelKey: "leftFlank", color: "var(--mantine-color-teal-6)" },
  { element: "right", labelKey: "rightFlank", color: "var(--mantine-color-orange-6)" },
];
const ELEMENT_COLORS = Object.fromEntries(
  ELEMENTS.map(({ element, color }) => [element, color]),
) as Record<FormationPreviewElement, string>;
const WEAPON_COLOR = "var(--mantine-color-gray-6)";

// All in metres
const MODEL_RADIUS = 0.35;
const WEAPON_SIZE = 1;
const PADDING = 1.5;
const MIN_HALF_WIDTH = 4;
const ASPECT_RATIO = 3 / 4; // height / width

const layoutPoints = (layout: FormationPreviewLayout): FormationPreviewPoint[] =>
  layout.weapon ? [...layout.models, layout.weapon] : layout.models;

type FormationCardProps = {
  preview: SquadFormationPreview;
  title?: string;
};

export const FormationCard = ({ preview, title }: FormationCardProps) => {
  const { t } = useTranslation(["explorer"]);

  const [optionIndex, setOptionIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(preview.squadSize);

  const option = preview.options[optionIndex] ?? preview.options[0];
  if (!option) return null;

  // Squad sizes (1 based) which can be drawn for the selected situation.
  const availableSizes = option.layouts.flatMap((layout, index) => (layout ? [index + 1] : []));
  const maxSize = availableSizes[availableSizes.length - 1];
  const squadSize = availableSizes.includes(selectedSize) ? selectedSize : maxSize;
  const layout = option.layouts[squadSize - 1];
  const fullLayout = option.layouts[maxSize - 1];
  if (!layout || !fullLayout) return null;

  const coverLabel = (coverType: string) =>
    t(`unitPage.formation.cover.${coverType}`, { defaultValue: coverType });

  const selectData = preview.options.map((item, index) => ({
    value: String(index),
    label: item.coverTypes.map(coverLabel).join(", "),
  }));

  // Fit the view around the models. SVG y goes down, the formation y (front) goes up.
  // The full squad defines the view, so it doesn't jump around when the squad size changes.
  const boundPoints = [...layoutPoints(fullLayout), ...layoutPoints(layout)];
  const xs = boundPoints.map((p) => p.x);
  const ys = boundPoints.map((p) => p.y);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(0, ...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(0, ...ys);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const halfWidth = Math.max(
    MIN_HALF_WIDTH,
    (maxX - minX) / 2 + PADDING,
    ((maxY - minY) / 2 + PADDING) / ASPECT_RATIO,
  );
  const halfHeight = halfWidth * ASPECT_RATIO;

  const viewMinX = centerX - halfWidth;
  const viewMinY = -(centerY + halfHeight);
  const viewWidth = halfWidth * 2;
  const viewHeight = halfHeight * 2;

  const gridLines: ReactElement[] = [];
  for (let x = Math.ceil(viewMinX); x <= viewMinX + viewWidth; x++) {
    gridLines.push(<line key={`x${x}`} x1={x} x2={x} y1={viewMinY} y2={viewMinY + viewHeight} />);
  }
  for (let y = Math.ceil(viewMinY); y <= viewMinY + viewHeight; y++) {
    gridLines.push(<line key={`y${y}`} y1={y} y2={y} x1={viewMinX} x2={viewMinX + viewWidth} />);
  }

  const legend = ELEMENTS.map((item) => ({
    ...item,
    count: layout.models.filter((model) => model.element === item.element).length,
  })).filter(({ count }) => count > 0);

  return (
    <Stack gap="sm" data-testid="formation-section">
      <Title order={6} style={{ textTransform: "uppercase" }} data-testid="formation-title">
        {title || t("unitPage.formation.title")}
      </Title>

      {selectData.length > 1 && (
        <Select
          size="xs"
          label={t("unitPage.formation.situation")}
          data={selectData}
          value={String(optionIndex)}
          onChange={(value) => setOptionIndex(Number(value) || 0)}
          allowDeselect={false}
          data-testid="formation-situation"
        />
      )}

      {availableSizes.length > 1 && (
        <Box>
          <Text size="xs" fw={500}>
            {t("unitPage.formation.squadSize")}: {squadSize}
          </Text>
          <Slider
            size="sm"
            min={availableSizes[0]}
            max={maxSize}
            step={1}
            value={squadSize}
            onChange={setSelectedSize}
            label={null}
            thumbLabel={t("unitPage.formation.squadSize")}
            marks={availableSizes.map((value) => ({ value }))}
            restrictToMarks
            data-testid="formation-squad-size"
          />
        </Box>
      )}

      <Stack gap={2} mt="xs">
        <Text size="xs" c="dimmed" ta="center">
          ▲ {t("unitPage.formation.front")}
        </Text>
        <Box
          component="svg"
          viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
          role="img"
          aria-label={t("unitPage.formation.title")}
          data-testid="formation-plot"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: "var(--mantine-radius-sm)",
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <g stroke="var(--mantine-color-default-border)" strokeWidth={0.03}>
            {gridLines}
          </g>
          {layout.weapon && (
            <rect
              x={layout.weapon.x - WEAPON_SIZE / 2}
              y={-layout.weapon.y - WEAPON_SIZE / 2}
              width={WEAPON_SIZE}
              height={WEAPON_SIZE}
              rx={0.15}
              fill={WEAPON_COLOR}
              fillOpacity={0.6}
            />
          )}
          {layout.models.map((model, index) => (
            <circle
              key={index}
              cx={model.x}
              cy={-model.y}
              r={MODEL_RADIUS}
              fill={ELEMENT_COLORS[model.element]}
              fillOpacity={0.85}
              stroke="var(--mantine-color-body)"
              strokeWidth={0.06}
            />
          ))}
        </Box>
      </Stack>

      <Group gap="sm" justify="center">
        {layout.weapon && (
          <Group gap={4} wrap="nowrap">
            <ColorSwatch color={WEAPON_COLOR} size={10} radius={2} withShadow={false} />
            <Text size="xs">{t("unitPage.formation.elements.weapon")}</Text>
          </Group>
        )}
        {legend.map(({ element, labelKey, color, count }) => (
          <Group key={element} gap={4} wrap="nowrap">
            <ColorSwatch color={color} size={10} withShadow={false} />
            <Text size="xs">
              {t(`unitPage.formation.elements.${labelKey}`)} ({count})
            </Text>
          </Group>
        ))}
      </Group>

      <Text size="xs" c="dimmed">
        {t("unitPage.formation.note")}
      </Text>
    </Stack>
  );
};
