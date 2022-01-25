/** @type {import("snowpack").SnowpackUserConfig } */
export default {
	mount: {
		public: '/',
	},
	buildOptions: {
		out: 'build',
	},
	plugins: ['@snowpack/plugin-typescript'],
};
