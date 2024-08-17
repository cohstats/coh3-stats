// import {
//   UnstyledButton,
//   Group,
//   Center,
//   Image,
//   Text,
//   Avatar,
//   Indicator,
// } from "@mantine/core";
// //import { createStyles } from '@mantine/emotion';
// import { SpotlightActionProps } from "@mantine/spotlight";
//
// const useStyles = createStyles((theme) => ({
//   action: {
//     position: "relative",
//     display: "block",
//     width: "100%",
//     padding: "10px 12px",
//     borderRadius: theme.radius.sm,
//   },
//
//   actionHovered: {
//     backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1],
//   },
// }));
//
// export const SearchPlayerEntry: React.FC<SpotlightActionProps> = ({
//   action,
//   hovered,
//   onTrigger,
//   ...others
// }) => {
//   const { classes, cx } = useStyles();
//   return (
//     <>
//       <UnstyledButton
//         className={cx(classes.action, { [classes.actionHovered]: hovered })}
//         tabIndex={-1}
//         onMouseDown={(event: any) => event.preventDefault()}
//         onClick={onTrigger}
//         {...others}
//       >
//          <Group wrap="nowrap">
//           <Center>
//             <Indicator
//               position="bottom-end"
//               label={
//                 <Image
//                   src={"/flags/4x3/" + action.country + ".svg"}
//                   alt={action.country}
//                   width={20}
//                 />
//               }
//               color="rgba(0,0,0,0)"
//             >
//               <Avatar src={action.image} alt={action.title} />
//             </Indicator>
//           </Center>
//
//           <div style={{ flex: 1 }}>
//             <Text>{action.title}</Text>
//
//             <Text c="dimmed" size="xs">
//               xp: {action.xp} level: {action.level}
//             </Text>
//           </div>
//         </Group>
//       </UnstyledButton>
//     </>
//   );
// };
