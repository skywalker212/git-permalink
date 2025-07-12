import * as assert from 'assert';
import { createPermalink } from '../extension';

suite('Extension Test Suite', () => {

	suite('createPermalink', () => {
		test('GitHub HTTPS URL, single line', () => {
			const url = createPermalink(
				'https://github.com/user/repo.git',
				'deadbeef',
				'src/index.js',
				15,
				15
			);
			assert.strictEqual(
				url,
				'https://github.com/user/repo/blob/deadbeef/src/index.js#L15'
			);
		});

		test('GitHub HTTPS URL, line range', () => {
			const url = createPermalink(
				'https://github.com/user/repo',
				'deadbeef',
				'src/index.js',
				20,
				25
			);
			assert.strictEqual(
				url,
				'https://github.com/user/repo/blob/deadbeef/src/index.js#L20-L25'
			);
		});

		test('GitLab HTTPS URL behaves like GitHub', () => {
			const url = createPermalink(
				'https://gitlab.com/group/project.git',
				'cafebabe',
				'lib/util.ts',
				1,
				1
			);
			assert.strictEqual(
				url,
				'https://gitlab.com/group/project/blob/cafebabe/lib/util.ts#L1'
			);
		});

		test('“git@” SSH URL is converted to HTTPS', () => {
			const url = createPermalink(
				'git@github.com:user/repo.git',
				'1234abcd',
				'app/main.py',
				5,
				5
			);
			assert.strictEqual(
				url,
				'https://github.com/user/repo/blob/1234abcd/app/main.py#L5'
			);
		});

		test('Bitbucket HTTPS URL, single line', () => {
			const url = createPermalink(
				'https://bitbucket.org/user/repo.git',
				'beadfeed',
				'README.md',
				3,
				3
			);
			assert.strictEqual(
				url,
				'https://bitbucket.org/user/repo/src/beadfeed/README.md#lines-3'
			);
		});

		test('Bitbucket HTTPS URL, line range', () => {
			const url = createPermalink(
				'https://bitbucket.org/user/repo',
				'beadfeed',
				'README.md',
				3,
				7
			);
			assert.strictEqual(
				url,
				'https://bitbucket.org/user/repo/src/beadfeed/README.md#lines-3:7'
			);
		});

		test('Unknown host falls back to blob path', () => {
			const url = createPermalink(
				'https://example.com/foo/bar.git',
				'feedface',
				'src/bar.js',
				42,
				42
			);
			assert.strictEqual(
				url,
				'https://example.com/foo/bar/blob/feedface/src/bar.js#L42'
			);
		});

		test('Backslashes in file path are normalized to forward slashes', () => {
			const url = createPermalink(
				'https://github.com/user/repo.git',
				'00ff00ff',
				'src\\components\\Button.tsx',
				10,
				10
			);
			assert.strictEqual(
				url,
				'https://github.com/user/repo/blob/00ff00ff/src/components/Button.tsx#L10'
			);
		});
	});
});
