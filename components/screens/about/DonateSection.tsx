import { Group, Anchor, Text } from "@mantine/core";
import config from "../../../config";
import { Donate } from "../../icon/donate";
import { PayPalDonation } from "../../other/paypal-donations";

const DonateSection = () => {
  return (
    <>
      Thank you all who already supported the project!
      <br />
      Actually you can support us in many ways. Bug reports, ideas or directly with code!
      <br />
      But money for covering the server costs is also appreciated. So we can run this site without
      any ads.
      <br />
      <br />
      All the donations are used for covering the server costs and expenses for running the site.
      <br />
      Our goal is to run the site as long as Relic servers are running for both coh2 and coh3.
      <br />
      <br />
      <Text fw={500}>Donation message:</Text>
      <Text>
        If possible, please mention your profile ID and mention coh3 or coh2 in your message. I am
        planning some perks for donators in the future.
      </Text>
      <br />
      <div>
        <div>
          <Group>
            <Text>
              All the donations are listed at{" "}
              <Anchor href={config.DONATION_LINK} target={"_blank"}>
                Ko-Fi
              </Anchor>
              :
            </Text>
            <Donate />
          </Group>

          <Text fz={"sm"} fs="italic">
            You can Donate via PayPal or Card at Ko-Fi, no registration required.
          </Text>
        </div>

        <Group pt={"xl"}>
          <Text>Direct PayPal if you have problems with Ko-Fi:</Text>
          <PayPalDonation />
        </Group>
      </div>
    </>
  );
};

export default DonateSection;
