import copy from 'rollup-plugin-copy'
import less from 'rollup-plugin-less';
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
export default {
  input: ['src/index.ts', 'src/index.less'],
  output: [
    {
      dir: 'cjs',
      format: 'cjs',
    },
    {
      dir: 'es',
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
      output: ['cjs/index.css', 'es/index.css'],
      include: 'src/index.less',
    }),
    copy({
      targets: [
        { src: 'src/index.less', dest: 'cjs' },
        { src: 'src/index.less', dest: 'es' },
      ],
    }),
  ],
}