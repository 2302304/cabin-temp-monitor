import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistinen lämpötilageneraattori
class TemperatureSimulator {
  private baseTemp: number;
  private location: string;
  
  constructor(location: string) {
    this.location = location;
    // Peruslämpötilat eri paikoille
    this.baseTemp = this.getBaseTemp(location);
  }
  
  private getBaseTemp(location: string): number {
    const temps: Record<string, number> = {
      'Olohuone': 21,
      'Makuuhuone': 19,
      'Sauna': 23,
      'Ulkona': 15,
      'Kellari': 17
    };
    return temps[location] || 20;
  }
  
  // Simuloi lämpötila tietylle ajanhetkelle
  generateTemp(date: Date): { temp: number; quality: string } {
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    let temp = this.baseTemp;
    
    // Sisätilat - pieni vuorokausivaihtelut
    if (this.location !== 'Ulkona') {
      // Yöllä hieman viileämpää
      const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 1.5;
      temp += dailyVariation;
      
      // Pieni satunnainen heilahdus
      temp += (Math.random() - 0.5) * 0.5;
    } else {
      // Ulkona suurempi vaihtelu
      const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
      temp += dailyVariation;
      
      // Säävaihtelu
      const weatherNoise = (Math.random() - 0.5) * 3;
      temp += weatherNoise;
    }
    
    // Simuloi satunnaisia katkoksia (1% todennäköisyys)
    const hasOutage = Math.random() < 0.01;
    if (hasOutage) {
      return { temp: 0, quality: 'ERROR' };
    }
    
    // Simuloi epätavallisia arvoja (2% todennäköisyys)
    const hasAnomaly = Math.random() < 0.02;
    if (hasAnomaly) {
      temp += (Math.random() - 0.5) * 5;
      return { temp: parseFloat(temp.toFixed(2)), quality: 'WARNING' };
    }
    
    return { temp: parseFloat(temp.toFixed(2)), quality: 'GOOD' };
  }
}

// Generoi aikasarja-dataa
async function generateHistoricalData(deviceId: string, simulator: TemperatureSimulator, daysBack: number) {
  const readings = [];
  const now = new Date();
  
  // Generoi dataa menneisyydestä
  for (let day = daysBack; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      // Mittaus joka 15. minuutti
      for (let minute = 0; minute < 60; minute += 15) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - day);
        timestamp.setHours(hour, minute, 0, 0);
        
        const { temp, quality } = simulator.generateTemp(timestamp);
        
        readings.push({
          deviceId,
          temperature: temp,
          humidity: parseFloat((45 + Math.random() * 20).toFixed(1)),
          timestamp,
          quality
        });
      }
    }
  }
  
  return readings;
}

async function main() {
  console.log('🌱 Aloitetaan tietokannan alustus...');
  
  // Tyhjennä vanhat tiedot
  await prisma.alert.deleteMany();
  await prisma.dailyStats.deleteMany();
  await prisma.reading.deleteMany();
  await prisma.device.deleteMany();
  
  console.log('🗑️  Vanhat tiedot poistettu');
  
  // Luo laitteet
  const devices = [
    { name: 'Olohuone', location: 'Olohuone' },
    { name: 'Makuuhuone', location: 'Makuuhuone' },
    { name: 'Sauna', location: 'Sauna' },
    { name: 'Ulkolämpömittari', location: 'Ulkona' },
  ];
  
  console.log('📱 Luodaan laitteita...');
  
  for (const deviceData of devices) {
    const device = await prisma.device.create({
      data: {
        name: deviceData.name,
        location: deviceData.location,
        deviceType: 'SEED',
        isActive: true,
        lastSeen: new Date()
      }
    });
    
    console.log(`  ✅ Laite luotu: ${device.name}`);
    
    // Generoi 30 päivän historia
    const simulator = new TemperatureSimulator(deviceData.location);
    const readings = await generateHistoricalData(device.id, simulator, 30);
    
    console.log(`  📊 Generoidaan ${readings.length} mittausta...`);
    
    // Tallenna mittaukset batcheina (tehokkuus)
    const batchSize = 1000;
    for (let i = 0; i < readings.length; i += batchSize) {
      const batch = readings.slice(i, i + batchSize);
      await prisma.reading.createMany({
        data: batch
      });
      console.log(`    💾 Tallennettu ${Math.min(i + batchSize, readings.length)}/${readings.length}`);
    }
    
    // Luo muutama hälytyseventtiä
    const recentReadings = readings.slice(-100);
    const extremeReadings = recentReadings.filter(r => 
      r.temperature < 15 || r.temperature > 26
    );
    
    if (extremeReadings.length > 0) {
      const sample = extremeReadings[0];
      await prisma.alert.create({
        data: {
          deviceId: device.id,
          alertType: sample.temperature > 26 ? 'TEMP_HIGH' : 'TEMP_LOW',
          severity: 'WARNING',
          message: `Lämpötila ${sample.temperature}°C poikkeaa normaalista`,
          value: sample.temperature,
          threshold: sample.temperature > 26 ? 25 : 16,
          isResolved: Math.random() > 0.5
        }
      });
    }
  }
  
  console.log('✨ Tietokanta alustettu onnistuneesti!');
  
  // Tulosta tilastoja
  const totalReadings = await prisma.reading.count();
  const totalDevices = await prisma.device.count();
  const totalAlerts = await prisma.alert.count();
  
  console.log('\n📈 Tilastot:');
  console.log(`  Laitteita: ${totalDevices}`);
  console.log(`  Mittauksia: ${totalReadings}`);
  console.log(`  Hälytyksiä: ${totalAlerts}`);
}

main()
  .catch((e) => {
    console.error('❌ Virhe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
