import * as assert from 'assert';
import * as sinon from 'sinon';
import * as cp from 'child_process';
import { getRemoteUrl, getCommitHash, createPermalink } from '../extension';

suite('Extension Test Suite', () => {

	suite('Git Helpers', () => {
		let execStub: sinon.SinonStub;

		suiteSetup(() => {
			execStub = sinon.stub();
			execStub = sinon.stub(cp, 'exec');
		});

		test('getRemoteUrl resolves a trimmed .git URL', async () => {
			execStub.yields(null, 'https://github.com/user/repo.git\n', '');
			const url = await getRemoteUrl('/some/repo');
			assert.strictEqual(url, 'https://github.com/user/repo.git');
		});

		test('getRemoteUrl rejects if exec errors', async () => {
			execStub.yields(new Error('fatal'), '', '');
			await assert.rejects(
				() => getRemoteUrl('/some/repo'),
				{ message: 'Could not get remote URL. Is this a git repository?' }
			);
		});

		test('getRemoteUrl rejects on stderr output', async () => {
			execStub.yields(null, '', 'something went wrong');
			await assert.rejects(
				() => getRemoteUrl('/some/repo'),
				{ message: 'something went wrong' }
			);
		});

		test('getCommitHash resolves a trimmed hash', async () => {
			execStub.yields(null, 'abcdef1234567890\n', '');
			const hash = await getCommitHash('/some/repo');
			assert.strictEqual(hash, 'abcdef1234567890');
		});

		test('getCommitHash rejects if exec errors', async () => {
			execStub.yields(new Error('fatal'), '', '');
			await assert.rejects(
				() => getCommitHash('/some/repo'),
				{ message: 'Could not get commit hash.' }
			);
		});
	});

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
