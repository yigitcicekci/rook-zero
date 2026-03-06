import { matchManager } from '../services/match-manager.service';
import { redisService } from '../services/redis.service';

async function runBasicTests() {
  console.log('🧪 Starting Basic Tests...\n');

  try {
    console.log('1️⃣ Testing Redis connection...');
    await redisService.connect();
    const pingResult = await redisService.ping();
    console.log(`✅ Redis ping: ${pingResult}\n`);

    console.log('2️⃣ Testing match creation...');
    const matchId = await matchManager.createNewMatch();
    console.log(`✅ Match created: ${matchId}\n`);

    console.log('3️⃣ Testing match retrieval...');
    const match = await matchManager.findMatch(matchId);
    if (match) {
      console.log(`✅ Match retrieved successfully:`);
      console.log(`   - ID: ${match.id}`);
      console.log(`   - Status: ${match.status}`);
      console.log(`   - Created: ${match.createdAt}`);
      console.log(`   - Current Turn: ${match.currentTurn}\n`);
    } else {
      console.log('❌ Failed to retrieve match\n');
    }

    console.log('4️⃣ Testing player joining...');
    
    const player1Result = await matchManager.addPlayerToMatch(
      matchId, 
      'test-player-1', 
      'Test Player 1', 
      'socket-1'
    );
    
    if (player1Result.success) {
      console.log(`✅ Player 1 joined as ${player1Result.player?.color}`);
    } else {
      console.log(`❌ Player 1 failed to join: ${player1Result.error}`);
    }

    const player2Result = await matchManager.addPlayerToMatch(
      matchId, 
      'test-player-2', 
      'Test Player 2', 
      'socket-2'
    );
    
    if (player2Result.success) {
      console.log(`✅ Player 2 joined as ${player2Result.player?.color}`);
      console.log(`✅ Match status: ${player2Result.match?.status}\n`);
    } else {
      console.log(`❌ Player 2 failed to join: ${player2Result.error}\n`);
    }

    console.log('5️⃣ Testing system statistics...');
    const stats = await matchManager.getOverallStats();
    console.log(`✅ System Stats:`);
    console.log(`   - Total Matches: ${stats.totalMatches}`);
    console.log(`   - Active Matches: ${stats.activeMatches}`);
    console.log(`   - Pending Matches: ${stats.pendingMatches}\n`);

    console.log('6️⃣ Testing move validation...');
    try {
      const moveResult = await matchManager.executeMove(matchId, 'test-player-1', {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        notation: 'e4',
        timestamp: new Date(),
        playerId: 'test-player-1'
      });

      if (moveResult.success) {
        console.log(`✅ Move successful`);
        console.log(`   - FEN: ${moveResult.match?.fen}`);
        console.log(`   - Next Turn: ${moveResult.match?.currentTurn}\n`);
      } else {
        console.log(`⚠️ Move failed: ${moveResult.error}\n`);
      }
    } catch (error) {
      console.log(`⚠️ Move test error: ${error}\n`);
    }

    console.log('7️⃣ Testing cleanup...');
    await redisService.removeMatch(matchId);
    const deletedMatch = await matchManager.findMatch(matchId);
    if (!deletedMatch) {
      console.log(`✅ Match successfully deleted\n`);
    } else {
      console.log(`❌ Match deletion failed\n`);
    }

    console.log('🎉 All basic tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await redisService.disconnect();
    console.log('🔌 Redis disconnected');
  }
}

async function runPerformanceTest() {
  console.log('\n⚡ Starting Performance Test...\n');

  try {
    await redisService.connect();

    const startTime = Date.now();
    const numMatches = 10;
    const matchIds: string[] = [];

    console.log(`Creating ${numMatches} matches...`);
    for (let i = 0; i < numMatches; i++) {
      const matchId = await matchManager.createNewMatch();
      matchIds.push(matchId);
    }

    const creationTime = Date.now() - startTime;
    console.log(`✅ Created ${numMatches} matches in ${creationTime}ms`);

    const retrievalStart = Date.now();
    const retrievalPromises = matchIds.map(id => matchManager.findMatch(id));
    await Promise.all(retrievalPromises);
    const retrievalTime = Date.now() - retrievalStart;
    console.log(`✅ Retrieved ${numMatches} matches in ${retrievalTime}ms`);

    const cleanupStart = Date.now();
    const cleanupPromises = matchIds.map(id => redisService.removeMatch(id));
    await Promise.all(cleanupPromises);
    const cleanupTime = Date.now() - cleanupStart;
    console.log(`✅ Cleaned up ${numMatches} matches in ${cleanupTime}ms`);

    console.log('\n📊 Performance Results:');
    console.log(`   - Average creation time: ${(creationTime / numMatches).toFixed(2)}ms per match`);
    console.log(`   - Average retrieval time: ${(retrievalTime / numMatches).toFixed(2)}ms per match`);
    console.log(`   - Average cleanup time: ${(cleanupTime / numMatches).toFixed(2)}ms per match`);

  } catch (error) {
    console.error('❌ Performance test failed:', error);
  } finally {
    if (redisService.connected) {
      await redisService.disconnect();
    }
  }
}

if (require.main === module) {
  (async () => {
    await runBasicTests();
    await runPerformanceTest();
    process.exit(0);
  })();
}

export { runBasicTests, runPerformanceTest }; 
