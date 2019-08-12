import copy from 'rollup-plugin-copy'
import less from 'rollup-plugin-less';
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      clean: true,
    }),
    less({
      insert: false,
      output: 'index.css',
      include: 'src/index.less',
    }),
    copy({
      targets: [
        { src: 'src/index.less', dest: 'dist'}
      ]
    }),
  ],
}