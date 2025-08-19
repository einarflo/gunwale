import React from "react";

const plans = [
	{
		name: "Free",
		price: "0 kr/mnd",
		features: [
			"Unlimited games",
            "No limit on participants",
            "Standard upgrades"
		],
		color: "from-blue-500/20 to-cyan-500/20",
		highlight: false,
	},
	{
		name: "Premium",
		price: "49 kr/mnd",
		features: [
			"Unlimited games",
            "No limit on participants",
            "Premium upgrades",
            "No ads"
		],
		color: "from-purple-500/20 to-pink-500/20",
		highlight: true,
	},
	{
		name: "Team",
		price: "199 kr/mnd",
		features: [
			"Unlimited games",
            "No limit on participants",
            "Premium upgrades",
            "Admin-panel",
            "No ads"
		],
		color: "from-yellow-500/20 to-orange-500/20",
		highlight: false,
	},
];

export default function FeatureGrid() {
	return (
		<section id="features" className="mx-auto max-w-7xl px-6 py-20">
			<div className="text-center mb-16">
				<h2 className="text-4xl font-bold mb-4 text-gray-800">
					Available Plans and Pricing
				</h2>
				<p className="text-xl text-gray-600">
					Select the plan that suits you best and gain access to more features!
				</p>
			</div>
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{plans.map((plan, idx) => (
					<PlanCard key={idx} {...plan} />
				))}
			</div>
		</section>
	);
}

function PlanCard({ name, price, features, color, highlight }: any) {
	return (
		<div
			className={`group relative overflow-hidden rounded-2xl border-2 ${
				highlight
					? "border-purple-500 shadow-xl shadow-purple-200/50 scale-105"
					: "border-gray-200"
			} bg-gradient-to-br from-white to-gray-50 p-6 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 transition-all duration-300 hover:scale-105`}
		>
			<div
				className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white font-bold text-lg`}
			>
				{name[0]}
			</div>
			<h3 className="relative text-2xl font-semibold mb-2 text-gray-800">
				{name}
			</h3>
			<div className="text-xl font-bold text-blue-600 mb-4">{price}</div>
			<ul className="mb-4 text-sm text-gray-700 list-disc list-inside">
				{features.map((f: string, i: number) => (
					<li key={i}>{f}</li>
				))}
			</ul>
			{highlight && (
				<div className="absolute top-4 right-4 text-white text-sm font-bold px-3 py-1 rounded-full shadow bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
					Best value
				</div>
			)}
		</div>
	);
}
