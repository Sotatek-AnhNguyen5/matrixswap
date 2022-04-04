import web3 from "web3";
import QuickSwapFarmABI from "./abi/QuickSwapFarmABI.json";
import SushiSwapFarmABI from "./abi/SushiFarmABI.json";
import ApeSwapFarmABI from "./abi/ApeSwapFarmABI.json";

export const ADDRESS_ZAP = "0xb39F269235A78e1F0745516f159D4154014b0e5e";
export const QUICKSWAP_STAKINGINFO_ADDRESS =
  "0x8aaa5e259f74c8114e0a471d9f2adfc66bfe09ed";
export const QUICKSWAP_USDT_WETH_PAIR = "0xF6422B997c7F54D1c6a6e103bcb1499EeA0a7046"

export const QUICKSWAP_FACTORY_ADDRESS =
  "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
export const SUSHI_FACTORY_ADDRESS =
  "0xc35dadb65012ec5796536bd9864ed8773abc74c4";
export const APE_SWAP_FACTORY = "0xCf083Be4164828f00cAE704EC15a36D711491284";

//Token
export const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

export const PBNB_TOKEN = {
  "name": "Orbit Bridge Polygon Binance Coin",
  "address": "0x7e9928aFe96FefB820b85B4CE6597B8F660Fe4F4",
  "symbol": "PBNB",
  "decimals": 18,
  "chainId": 137,
  "logoURI": "https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png?1547034615"
}


export const USDC_TOKEN = {
  name: "USD Coin",
  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  symbol: "USDC",
  decimals: 6,
  chainId: 137,
  logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
};

export const DAI_TOKEN = {
  name: "Dai Stablecoin",
  address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  symbol: "DAI",
  decimals: 18,
  chainId: 137,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
};

export const WETH_TOKEN = {
  name: "Ether",
  address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  symbol: "ETH",
  decimals: 18,
  chainId: 137,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
};

export const USDT_TOKEN = {
  name: "Tether USD",
  address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  symbol: "USDT",
  decimals: 6,
  chainId: 137,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
};

export const SUSHI_TOKEN = {
  address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
  symbol: "SUSHI",
  decimals: "18",
  name: "SushiToken (PoS)",
};

export const WMATIC_TOKEN = {
  address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  symbol: "WMATIC",
  decimals: "18",
  name: "Wrapped Matic",
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png",
};
//from apeswap
export const BANANA_TOKEN = {
  address: "0x5d47baba0d66083c52009271faf3f50dcc01023c",
  symbol: "BANANA",
  decimals: "18",
  name: "ApeSwapFinance Banana",
};

export const DRAGON_QUICK_TOKEN = {
  address: "0xf28164a485b0b2c90639e47b0f377b4a438a16b1",
  symbol: "dQUICK",
  decimals: "18",
  name: "Dragon QUICK",
};

export const FRAX_TOKEN = {
  address: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
  symbol: "FRAX",
  decimals: "18",
  name: "FRAX",
};

export const WATCH_TOKEN = {
  address: "0x09211dc67f9fe98fb7bbb91be0ef05f4a12fa2b2",
  symbol: "WATCH",
  decimals: "18",
  name: "yieldwatch",
};

export const ABR_TOKEN = {
  address: "0x04429fbb948bbd09327763214b45e505a5293346",
  symbol: "ABR",
  decimals: "18",
  name: "Allbridge",
};

export const FARM_TYPE = {
  quickswap: "quick",
  sushiswap: "sushi",
  apeswap: "apes",
};

export const BASE_TOKENS_SORT = [DAI_TOKEN, WETH_TOKEN, USDT_TOKEN, USDC_TOKEN, WMATIC_TOKEN, DRAGON_QUICK_TOKEN, FRAX_TOKEN]


export const PROTOCOL_FUNCTION = {
  [FARM_TYPE.quickswap]: {
    fullnameHash: web3.utils.soliditySha3("QUICKSWAP"),
    fullname: "QUICKSWAP",
    stake: "stake",
    unStake: "exit",
    rewardFunction: "sushiPerSecond",
    getReward: "getReward",
    factoryAddress: QUICKSWAP_FACTORY_ADDRESS,
    abi: QuickSwapFarmABI,
  },
  [FARM_TYPE.sushiswap]: {
    fullnameHash: web3.utils.soliditySha3("SUSHISWAP"),
    fullname: "SUSHISWAP",
    stake: "deposit",
    unStake: "withdrawAndHarvest",
    rewardFunction: "bananaPerSecond",
    getReward: "harvest",
    factoryAddress: SUSHI_FACTORY_ADDRESS,
    abi: SushiSwapFarmABI,
  },
  [FARM_TYPE.apeswap]: {
    fullnameHash: web3.utils.soliditySha3("APESWAP"),
    fullname: "APESWAP",
    stake: "deposit",
    getReward: "harvest",
    unStake: "withdrawAndHarvest",
    factoryAddress: APE_SWAP_FACTORY,
    abi: ApeSwapFarmABI,
  },
};
export const DEFAULT_PAIR = [
  {
    id: "0xdc9232e2df177d7a12fdff6ecbab114e2231198d",
    reserveUSD: "96333550.2788532674908898",
  },
  {
    id: "0x853ee4b2a13f8a742d64c8f088be7ba2131f670d",
    reserveUSD: "74486095.3689184649956629",
  },
  {
    id: "0x2cf7252e74036d1da831d11089d326296e64a728",
    reserveUSD: "18698014.7197435528975322",
  },
  {
    id: "0x5ca6ca6c3709e1e6cfe74a50cf6b2b6ba2dadd67",
    reserveUSD: "21263237.2754593956224769",
  },
  {
    id: "0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046",
    reserveUSD: "19196122.8630270080937009",
  },
  {
    id: "0x90bc3e68ba8393a3bf2d79309365089975341a43",
    reserveUSD: "18126686.9104804508466590",
  },
  {
    id: "0xf6a637525402643b0654a54bead2cb9a83c8b498",
    reserveUSD: "14202685.6183925288187090",
  },
  {
    id: "0x4a35582a710e1f4b2030a3f826da20bfb6703c09",
    reserveUSD: "13734776.9068213802222398",
  },
  {
    id: "0x1bd06b96dd42ada85fdd0795f3b4a79db914add5",
    reserveUSD: "9463916.7230525651659686",
  },
  {
    id: "0xf04adbf75cdfc5ed26eea4bbbb991db002036bdd",
    reserveUSD: "9719970.9351067530443667",
  },
  {
    id: "0x74214f5d8aa71b8dc921d8a963a1ba3605050781",
    reserveUSD: "8538171.4589437796839785",
  },
  {
    id: "0xe89fae1b4ada2c869f05a0c96c87022dadc7709a",
    reserveUSD: "7494005.9990835438551146",
  },
  {
    id: "0xf7135272a5584eb116f5a77425118a8b4a2ddfdb",
    reserveUSD: "5837365.1591132677531158",
  },
  {
    id: "0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb",
    reserveUSD: "4763464.4140249382323001",
  },
  {
    id: "0x62052b489cb5bc72a9dc8eeae4b24fd50639921a",
    reserveUSD: "4607631.2287756807473169",
  },
  {
    id: "0x10062ec62c0be26cc9e2f50a1cf784a89ded075f",
    reserveUSD: "3836275.3984159625365532",
  },
  {
    id: "0x898386dd8756779a4ba4f1462891b92dd76b78ef",
    reserveUSD: "3414822.3153390145267223",
  },
  {
    id: "0x5ef8747d1dc4839e92283794a10d448357973ac0",
    reserveUSD: "3209280.2140550266951230",
  },
  {
    id: "0xeb477ae74774b697b5d515ef8ca09e24fee413b5",
    reserveUSD: "2838941.4304051692451769",
  },
  {
    id: "0x6e53cb6942e518376e9e763554db1a45ddcd25c4",
    reserveUSD: "2834506.1724792592092609",
  },
  {
    id: "0x59153f27eefe07e5ece4f9304ebba1da6f53ca88",
    reserveUSD: "2760718.0587605403363637",
  },
  {
    id: "0x9f77ef7175032867d26e75d2fa267a6299e3fb57",
    reserveUSD: "2570753.9164193886445669",
  },
  {
    id: "0xe55739e1feb9f9aed4ce34830a06ca6cc37494a0",
    reserveUSD: "2107702.6795638238086663",
  },
  {
    id: "0x5f819f510ca9b1469e6a3ffe4ecd7f0c1126f8f5",
    reserveUSD: "1441458.1576399680829368",
  },
  {
    id: "0x13305f843e66f7cc7f9cb1bbc40dabee7086d1f8",
    reserveUSD: "1369789.4603316453039517",
  },
  {
    id: "0x7805b64e2d99412d3b8f10dfe8fc55217c5cc954",
    reserveUSD: "1443943.1067937800969108",
  },
  {
    id: "0x2d252d4a903a450afa9dac54cb696f0690259a62",
    reserveUSD: "1368895.5531045462956991",
  },
  {
    id: "0x8c1b40ea78081b70f661c3286c74e71b4602c9c0",
    reserveUSD: "1373857.0699455871593146",
  },
  {
    id: "0xab1403de66519b898b38028357b74df394a54a37",
    reserveUSD: "1326938.2625259660437897",
  },
  {
    id: "0x9e2b254c7d6ad24afb334a75ce21e216a9aa25fc",
    reserveUSD: "1225077.5254150506172394",
  },
  {
    id: "0x25bae75f6760ac30554cc62f9282307c3038c3a0",
    reserveUSD: "1140405.1646553754157635",
  },
  {
    id: "0x70294d7aa244bd342c536f9b502152564057162e",
    reserveUSD: "1039554.3666022877347688",
  },
  {
    id: "0x7051810a53030171f01d89e9aebd8a599de1b530",
    reserveUSD: "959083.3971638926495055",
  },
  {
    id: "0xd2b61a42d3790533fedc2829951a65120624034a",
    reserveUSD: "852334.6595045562027968",
  },
  {
    id: "0xe4139dbf19e9c8d880f915711c8674022979d432",
    reserveUSD: "874622.9752322964900591",
  },
  {
    id: "0x40a5df3e37152d4daf279e0450289af76472b02e",
    reserveUSD: "788246.7714320510518993",
  },
  {
    id: "0xbedee6a7c572aa855a0c84d2f504311d482862f4",
    reserveUSD: "690703.5948099059838681",
  },
  {
    id: "0x4b4c614b9219397c02296f6f4e2351259840b3c7",
    reserveUSD: "828765.3954198751097647",
  },
  {
    id: "0xfe4ba2ab8562b6204a17f19651c760818a361571",
    reserveUSD: "838586.9950463028004112",
  },
  {
    id: "0x631f39d22430e889a3cfbea4fd73ed101059075f",
    reserveUSD: "844811.7028002438933735",
  },
  {
    id: "0xad431d0bde99e21d9848691615a0756a09ed3dce",
    reserveUSD: "841002.5991977976193875",
  },
  {
    id: "0x30167fea9499c11795bfd104667240bdac939d3a",
    reserveUSD: "692458.7260742466335480",
  },
  {
    id: "0x23baf6d86c80eb18b1799763ea47eae6fe727767",
    reserveUSD: "651461.7865170407775564",
  },
  {
    id: "0x7ca8e540df6326005b72661e50f1350c84c0e55d",
    reserveUSD: "553260.5170869779121831",
  },
  {
    id: "0xf366df119532b2e0f4e416c81d6ff7728a60fe7d",
    reserveUSD: "654542.6869136837998958",
  },
  {
    id: "0x5fb641de2663e8a94c9dea0a539817850d996e99",
    reserveUSD: "695835.9772234208556427",
  },
  {
    id: "0x3dd6a0d31818fdacd2724f2b0b3b220f14a54215",
    reserveUSD: "587342.3919615175251512",
  },
  {
    id: "0xa651ef83fa6a90e76206de4e79a5c69f80994556",
    reserveUSD: "585210.8542546823026592",
  },
  {
    id: "0x58ffb271c6f3d92f03c49e08e2887810f65b8cd6",
    reserveUSD: "550100.1141226905344448",
  },
  {
    id: "0x66c37a00e426a613b188180198aac12b0b4ae4d4",
    reserveUSD: "524104.1620693323722656",
  },
  {
    id: "0x253d637068fbf11b18d0f2a1bf3b167d37802687",
    reserveUSD: "536413.6709709036665341",
  },
  {
    id: "0x53b02ad5f6615262ec5b483937260135429d5af9",
    reserveUSD: "401512.7584897021554089",
  },
  {
    id: "0x602fe85ceba5d27fd4d48c241cfb83ce045a179d",
    reserveUSD: "453429.6080952577324730",
  },
  {
    id: "0x15551bedc20b01b473da93e6cfa29b1eb7baeabb",
    reserveUSD: "455691.1188910400368162",
  },
  {
    id: "0x976b7b7fe4293111cacd946c422a64f24a223564",
    reserveUSD: "520303.0082157045932236",
  },
  {
    id: "0xc52f4e49c7fb3ffceb48ad06c3f3a17ad5c0dbfe",
    reserveUSD: "469353.5041245070821495",
  },
  {
    id: "0x7f7c12acec546cdceb028cc5b57f7aa2d91f0887",
    reserveUSD: "444282.0971534783714365",
  },
  {
    id: "0x23e93ce78d7fb5287e4b6a8d91403bc5e7ac845a",
    reserveUSD: "420045.0995950060308622",
  },
  {
    id: "0x222789b185a145ccbd19803a448143252612d012",
    reserveUSD: "417967.0386562668323086",
  },
  {
    id: "0x1fef1ce437bb025c08609e0c14ab916622bd09f4",
    reserveUSD: "385168.8918934132460486",
  },
  {
    id: "0xfcb980cfd282027b7a0544802a03b8af63ee9cc4",
    reserveUSD: "422233.2174373649206676",
  },
  {
    id: "0xdfa81e266ff54a7d9d26c5083f9631e685d833d7",
    reserveUSD: "373450.5604449372872432",
  },
  {
    id: "0x1585d301b58661bc0cb5a8eba24ecae7b4600470",
    reserveUSD: "257885.2329203274555212",
  },
  {
    id: "0xbf453e64ee7f43513afdc801f6c0fab250fbcf09",
    reserveUSD: "254478.9026204799348132",
  },
  {
    id: "0x8095d1fb36138fc492337a63c52d03764d12e771",
    reserveUSD: "255431.0128227674744123",
  },
  {
    id: "0xf7e659966196f069a23ce9b84b9586a809c4cd9a",
    reserveUSD: "249295.4397974986496963",
  },
  {
    id: "0xf745a6358790f7a2ef5da0538b714cbbcc635c40",
    reserveUSD: "242711.4260577679686007",
  },
  {
    id: "0xb417da294ae7c5cbd9176d1a7a0c7d7364ae1c4e",
    reserveUSD: "243617.1026731476332841",
  },
  {
    id: "0x29429e4099ed88884729b8fa800b9c65dbe57b63",
    reserveUSD: "234868.6150187203606870",
  },
  {
    id: "0xdfb3d129f32b32852e74322e699580d75ca4521e",
    reserveUSD: "219774.3696838334181516",
  },
  {
    id: "0x7600cc75fa9045986efe0bddee8e18621a8dd49e",
    reserveUSD: "228526.5153767450499130",
  },
  {
    id: "0x8df6f7da556b9e70e272434bdc581dbb4848dffc",
    reserveUSD: "205930.7998391734337215",
  },
  {
    id: "0x1c75bd54ad15449d12e6c24a9b5e8ce1a62c567c",
    reserveUSD: "202210.8202103609048033",
  },
  {
    id: "0x972d0c9d46742d04a35e2521e8ff1657e8107b2c",
    reserveUSD: "223613.9766538412727304",
  },
  {
    id: "0x150255a6ba2d32ac058e8b435a445f5137a21857",
    reserveUSD: "171256.2489540598446426",
  },
  {
    id: "0xd0a4bbb49ddd36b0d832d485974a2387d81dbdd3",
    reserveUSD: "329164.2553519528528594",
  },
  {
    id: "0x8000fe11cffa3ced146d98f091d95c9bc2c55c97",
    reserveUSD: "163378.7518543819672545",
  },
  {
    id: "0xfd0e242c95b271844bf6860d4bc0e3e136bc0f7c",
    reserveUSD: "162902.9777531070698573",
  },
  {
    id: "0x8167d3156fccdbaf3e43ae019a0e842e5d1f1ac1",
    reserveUSD: "165747.0140684353054815",
  },
  {
    id: "0x12909209228cedad659a6e13d41f82a4d53ee8d1",
    reserveUSD: "157342.5679093698168386",
  },
  {
    id: "0x082b58350a04d8d38b4bcae003bb1191b9aae565",
    reserveUSD: "165019.5715537630479935",
  },
  {
    id: "0xd5211a55d978bf651b9da899cc8bb09491ff39a1",
    reserveUSD: "182812.7755584639909684",
  },
  {
    id: "0xa28864af52aedcef717c34bffca2ccf9d6aa23cc",
    reserveUSD: "149760.9665120564393725",
  },
  {
    id: "0x5701026955d90e9d9ea79eba2cc70596a6a7accd",
    reserveUSD: "146112.6705487751833909",
  },
  {
    id: "0x4c27eee5f50eeee292ef438a87a42292bd629e70",
    reserveUSD: "131166.8274587362157459",
  },
  {
    id: "0xca8e44fdf749a7c5c28bc927726ea21ccd669969",
    reserveUSD: "116417.6159608407477242",
  },
  {
    id: "0x666dd949db4f3807c6e8e360a79473a5f0c7075a",
    reserveUSD: "126860.5418909785580816",
  },
  {
    id: "0xb56843b5550e3f78613ca5abf6bd6ae6f84cd11e",
    reserveUSD: "135143.1483504827392056",
  },
  {
    id: "0xb980171e5647a8531d3b28134622d225bc3cdb82",
    reserveUSD: "130458.6785791957037128",
  },
  {
    id: "0x592d8faea9e740facbd6115abd92d2e6acb2f8f1",
    reserveUSD: "117141.3715648218003451",
  },
  {
    id: "0x36d906b17371678ba39de21b8631854c9490e87e",
    reserveUSD: "95698.4340293778582969",
  },
  {
    id: "0x5938dc50094e151c7dd64e5b774a2a91cd414daf",
    reserveUSD: "117822.9693650204729129",
  },
  {
    id: "0x3ba7afa5f600be15607b89d03f98aa791c8ecef8",
    reserveUSD: "72098.5897390980328446",
  },
  {
    id: "0x8bab360e41468dff5326df636e2377a858ad0670",
    reserveUSD: "70954.7117334447658980",
  },
];
