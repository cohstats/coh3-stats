import { createStyles, UnstyledButton, Group, Center, Image, Text, Badge } from "@mantine/core";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  action: {
    position: "relative",
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: theme.radius.sm,
  },

  actionHovered: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1],
  },
}));

export const SearchPlayerEntry: React.FC<any> = ({
  action,
  styles,
  classNames,
  hovered,
  onTrigger,
  ...others
}) => {
  const { classes, cx } = useStyles();
  return (
    <>
      <Link href={"/players/" + action.playerID}>
        <UnstyledButton
          className={cx(classes.action, { [classes.actionHovered]: hovered })}
          tabIndex={-1}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onTrigger}
          {...others}
        >
          <Group noWrap>
            <Center>
              <Image src={action.image} alt={action.title} width={50} height={50} />
            </Center>

            <div style={{ flex: 1 }}>
              <Text>{action.title}</Text>

              <Text color="dimmed" size="xs">
                country: {action.country} xp: {action.xp} level: {action.level}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
    </>
  );
};
