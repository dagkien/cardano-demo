import { useState } from "react";

const css = `
    .container2 {
        display: flex;
        justify-content: center;
        align-items: center;
        background: white;
        gap: 10px;
        width: fit-content;
        padding: 40px;
        margin: 50px auto;
    }
    input, textarea {
        padding: 10px 20px;
        border-radius: 10px;
        margin: 10px;
    }
    textarea {
        width: 400px;
        height: 200px;
    }
    .img {
        height: 250px;
        width: 250px;
        border: 5px solid #4fdbcb;
        border-radius: 10px;
    }
    button {
        padding: 10px 20px;
        border-radius: 10px;
        margin-left: 6px;
        background: violet;
        cursor: pointer;
    }
    h2 {
        text-align: center;
        padding: 20px;
    }
`;

const MintNFT = () => {
	const [metadata, setMetadata] = useState({});
	const handleChange = (e: any) => {
		const { name, value, files } = e.target;
		if (value) {
			setMetadata({
				...metadata,
				[name]: value,
			});
		} else {
			setMetadata({
				...metadata,
				[name]: files,
			});
		}
	};

	const onMint = () => {
		console.log(metadata);
	};
	return (
		<>
			<style>{css}</style>
			<h2>DEMO MINT NFT</h2>
			<div className="container2">
				<div>
					<div className="img">
						<img src={metadata?.nftImage} />
					</div>
					<input type="file" onChange={handleChange} name="nftImage" />
				</div>
				<div>
					<div>
						<input placeholder="name" name="name" onChange={handleChange} />
					</div>
					<div>
						<input
							placeholder="categories"
							name="categories"
							onChange={handleChange}
						/>
					</div>
					<div>
						<input placeholder="author" name="auhtor" onChange={handleChange} />
					</div>
					<div>
						<textarea
							placeholder="description"
							name="description"
							onChange={handleChange}
						></textarea>
					</div>
					<div>
						<button onClick={onMint}>Mint NFT</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MintNFT;
