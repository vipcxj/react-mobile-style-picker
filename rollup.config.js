import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy'
import less from 'rollup-plugin-less';
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.es.js',
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ],
  plugins: [
    clear({
      targets: ['dist'],
    }),
    typescript({
      typescript: require('typescript'),
      clean: true,
    }),
    less({
      output: 'dist/index.css',
      include: 'src/index.less',
    }),
    copy({
      targets: [
        { src: 'src/index.less', dest: 'dist' },
        { src: 'src/loading.css', dest: 'dist' },
      ],
    }),
  ],
}