import { Container, Grid, Skeleton, useMantineTheme } from "@mantine/core";
import React from "react";

const PRIMARY_COL_HEIGHT = 300;

export const NewsSection: React.FC = () => {
  const theme = useMantineTheme();
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

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
