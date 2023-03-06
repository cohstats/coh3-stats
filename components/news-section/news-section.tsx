import { Container, Grid, Skeleton, useMantineTheme, px } from "@mantine/core";
import React from "react";

const PRIMARY_COL_HEIGHT = 200;

export const NewsSection: React.FC = () => {
  const theme = useMantineTheme();
  const SECONDARY_COL_HEIGHT = `calc(calc(${PRIMARY_COL_HEIGHT} / 2) - calc(${theme.spacing.md} / 2))`;

  return (
    <Container my="md">
      <Grid gutter="md">
        <Grid.Col span={8}>
          <Skeleton height={PRIMARY_COL_HEIGHT} radius="md" animate={false} />
        </Grid.Col>
        <Grid.Col span={4}>
          <Grid gutter="md">
            <Grid.Col>
              <Skeleton height={SECONDARY_COL_HEIGHT} radius="md" animate={false} />
            </Grid.Col>
            <Grid.Col>
              <Skeleton height={SECONDARY_COL_HEIGHT} radius="md" animate={false} />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
