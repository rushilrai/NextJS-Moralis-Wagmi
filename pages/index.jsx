import { getSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import {
    usePrepareContractWrite,
    useContractWrite,
    useContractRead,
    useConnect,
} from "wagmi";
import abi from "../contract/abi.json";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { goerli } from "wagmi/chains";

function Home({ user }) {
    const connector = new MetaMaskConnector({
        chains: [goerli],
    });
    const connect = useConnect({
        connector: connector,
    });

    const config = usePrepareContractWrite({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi: abi,
        functionName: "setRole",
        args: [],
    });
    const setRole = useContractWrite(config.config);

    const getRole = useContractRead({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi: abi,
        functionName: "getRole",
        args: [],
    });

    useEffect(() => {
        connect.connect();
    }, []);

    useEffect(() => {
        console.log(config.error);
    }, [config]);

    useEffect(() => {
        console.log(getRole.data);
    }, [getRole]);

    return (
        <div>
            <h4>User session:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <button onClick={() => signOut({ redirect: "/signin" })}>
                Sign out
            </button>
            <br />
            <button disabled={!setRole.write} onClick={() => setRole.write?.()}>
                Set Role
            </button>
            {setRole.isLoading && <div>Doing .....</div>}
            {setRole.isSuccess && <div>Set Role Done</div>}
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: "/signin",
                permanent: false,
            },
        };
    }

    return {
        props: { user: session.user },
    };
}

export default Home;
