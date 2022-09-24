import type { NextPage } from "next";
import Head from "next/head";


/**
 * This is example page you can find it by going on ur /example
 * @constructor
 */
const Example: NextPage = () => {
    return (
        <div>
            {/*This is custom HEAD overwrites the default one*/}
            <Head>
                <title>Example title</title>
                <meta name="description" content="custom example description " />
            </Head>
          This is example page
        </div>
    );
};

export default Example;
