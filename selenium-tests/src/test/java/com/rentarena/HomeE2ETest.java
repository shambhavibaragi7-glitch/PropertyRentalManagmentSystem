package com.rentarena;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;

public class HomeE2ETest {
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new"); // Runs browser headlessly for CLI/CI stability
        options.addArguments("--window-size=1920,1080"); // Ensure desktop resolution to avoid overlapping elements
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        driver.get("http://localhost:8000/");
    }

    @Test
    public void testWelcomeMessageAndTitle() {
        Assert.assertTrue(driver.getTitle().contains("RentArena Property Rental System"));

        WebElement logo = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("navLogo")));
        Assert.assertTrue(logo.isDisplayed());

        WebElement welcomeTitle = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("h1[data-local='welcome']")));
        Assert.assertEquals(welcomeTitle.getText(), "Welcome to RentArena Zero Brokerage Rental");
    }

    @Test
    public void testThemeToggle() {
        WebElement html = driver.findElement(By.tagName("html"));
        String initialTheme = html.getAttribute("data-theme");
        Assert.assertTrue(initialTheme.equals("dark") || initialTheme.equals("light"));

        WebElement themeBtn = driver.findElement(By.id("themeToggle"));
        themeBtn.click();

        String toggledTheme = html.getAttribute("data-theme");
        String expectedTheme = "dark".equals(initialTheme) ? "light" : "dark";
        Assert.assertEquals(toggledTheme, expectedTheme);

        themeBtn.click();
        String restoredTheme = html.getAttribute("data-theme");
        Assert.assertEquals(restoredTheme, initialTheme);
    }

    @Test
    public void testLanguageSwitching() {
        WebElement welcomeTitle = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("h1[data-local='welcome']")));
        WebElement langDropdown = driver.findElement(By.id("langSelect"));
        Select select = new Select(langDropdown);

        // 1. Initial (English)
        Assert.assertEquals(welcomeTitle.getText(), "Welcome to RentArena Zero Brokerage Rental");

        // 2. French
        select.selectByValue("fr");
        wait.until(ExpectedConditions.textToBePresentInElement(welcomeTitle, "Bienvenue chez RentArena - Location Sans Commission"));
        Assert.assertEquals(welcomeTitle.getText(), "Bienvenue chez RentArena - Location Sans Commission");

        // 3. Spanish
        select.selectByValue("es");
        wait.until(ExpectedConditions.textToBePresentInElement(welcomeTitle, "Bienvenido a RentArena - Alquiler Sin Intermediarios"));
        Assert.assertEquals(welcomeTitle.getText(), "Bienvenido a RentArena - Alquiler Sin Intermediarios");

        // 4. Back to English
        select.selectByValue("en");
        wait.until(ExpectedConditions.textToBePresentInElement(welcomeTitle, "Welcome to RentArena Zero Brokerage Rental"));
        Assert.assertEquals(welcomeTitle.getText(), "Welcome to RentArena Zero Brokerage Rental");
    }

    @Test
    public void testCategoryExploration() {
        WebElement firstCategoryCard = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".service-card")));
        firstCategoryCard.click();

        WebElement categoryExploreSection = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("viewCategoryExplore")));
        String classes = categoryExploreSection.getAttribute("class");
        Assert.assertTrue(classes.contains("active"));

        WebElement backBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("#viewCategoryExplore .back-btn")));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", backBtn);

        WebElement homeSection = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("viewHome")));
        String homeClasses = homeSection.getAttribute("class");
        Assert.assertTrue(homeClasses.contains("active"));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
