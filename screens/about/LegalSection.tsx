import { Anchor, Text } from "@mantine/core";
import Link from "next/link";
import { getPrivacyPolicyRoute } from "../../src/routes";

const LegalSection = () => {
  return (
    <>
      <Text>
        <Anchor component={Link} href={getPrivacyPolicyRoute()}>
          Privacy Policy
        </Anchor>
      </Text>
    </>
  );
};

export default LegalSection;
