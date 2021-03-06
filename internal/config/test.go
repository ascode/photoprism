package config

import (
	"flag"
	"fmt"
	"os"
	"testing"

	_ "github.com/jinzhu/gorm/dialects/mysql"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/photoprism/photoprism/internal/util"
	"github.com/urfave/cli"

	log "github.com/sirupsen/logrus"
)

const (
	TestDataZip  = "/tmp/photoprism/testdata.zip"
	TestDataURL  = "https://dl.photoprism.org/fixtures/testdata.zip"
	TestDataHash = "1a59b358b80221ab3e76efb683ad72402f0b0844"
)

var testConfig *Config

func testDataPath(assetsPath string) string {
	return assetsPath + "/testdata"
}

func NewTestParams() *Params {
	assetsPath := util.ExpandedFilename("../../assets")

	testDataPath := testDataPath(assetsPath)

	c := &Params{
		DarktableCli:   "/usr/bin/darktable-cli",
		AssetsPath:     assetsPath,
		CachePath:      testDataPath + "/cache",
		OriginalsPath:  testDataPath + "/originals",
		ImportPath:     testDataPath + "/import",
		ExportPath:     testDataPath + "/export",
		DatabaseDriver: "mysql",
		DatabaseDsn:    "photoprism:photoprism@tcp(database:3306)/photoprism?parseTime=true",
	}

	return c
}

func TestConfig() *Config {
	if testConfig == nil {
		testConfig = NewTestConfig()
	}

	return testConfig
}

func NewTestConfig() *Config {
	log.SetLevel(log.DebugLevel)

	c := &Config{config: NewTestParams()}

	c.MigrateDb()

	return c
}

// Returns example cli config for testing
func CliTestContext() *cli.Context {
	config := NewTestParams()

	globalSet := flag.NewFlagSet("test", 0)
	globalSet.Bool("debug", false, "doc")
	globalSet.String("config-file", config.ConfigFile, "doc")
	globalSet.String("assets-path", config.AssetsPath, "doc")
	globalSet.String("originals-path", config.OriginalsPath, "doc")
	globalSet.String("darktable-cli", config.DarktableCli, "doc")

	app := cli.NewApp()

	c := cli.NewContext(app, globalSet, nil)

	c.Set("config-file", config.ConfigFile)
	c.Set("assets-path", config.AssetsPath)
	c.Set("originals-path", config.OriginalsPath)
	c.Set("darktable-cli", config.DarktableCli)

	return c
}

func (c *Config) RemoveTestData(t *testing.T) {
	os.RemoveAll(c.ImportPath())
	os.RemoveAll(c.ExportPath())
	os.RemoveAll(c.OriginalsPath())
	os.RemoveAll(c.CachePath())
}

func (c *Config) DownloadTestData(t *testing.T) {
	if util.Exists(TestDataZip) {
		hash := util.Hash(TestDataZip)

		if hash != TestDataHash {
			os.Remove(TestDataZip)
			t.Logf("removed outdated test data zip file (fingerprint %s)\n", hash)
		}
	}

	if !util.Exists(TestDataZip) {
		fmt.Printf("downloading latest test data zip file from %s\n", TestDataURL)

		if err := util.Download(TestDataZip, TestDataURL); err != nil {
			fmt.Printf("Download failed: %s\n", err.Error())
		}
	}
}

func (c *Config) UnzipTestData(t *testing.T) {
	if _, err := util.Unzip(TestDataZip, testDataPath(c.AssetsPath())); err != nil {
		t.Logf("could not unzip test data: %s\n", err.Error())
	}
}

func (c *Config) InitializeTestData(t *testing.T) {
	t.Log("initializing test data")

	c.RemoveTestData(t)

	c.DownloadTestData(t)

	c.UnzipTestData(t)
}
