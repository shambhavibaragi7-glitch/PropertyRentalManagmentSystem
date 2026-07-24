package com.rentarena;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ExtentReportListener implements ITestListener {
    private static ExtentReports extent;
    private static ThreadLocal<ExtentTest> test = new ThreadLocal<>();

    @Override
    public void onStart(ITestContext context) {
        String reportPath = System.getProperty("user.dir") + "/target/extent-reports/ExtentReport.html";
        
        ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath);
        sparkReporter.config().setDocumentTitle("RentArena Automation Report");
        sparkReporter.config().setReportName("RentArena E2E Test Execution");
        sparkReporter.config().setTheme(Theme.STANDARD); // White/light theme matching user screenshot

        extent = new ExtentReports();
        extent.attachReporter(sparkReporter);
        extent.setSystemInfo("Host Name", "RentArena Server");
        extent.setSystemInfo("Environment", "Local QA");
        extent.setSystemInfo("User Name", "QA Engineer");
    }

    @Override
    public void onTestStart(ITestResult result) {
        String testName = result.getTestClass().getRealClass().getSimpleName() + " - " + result.getMethod().getMethodName();
        ExtentTest extentTest = extent.createTest(testName);
        test.set(extentTest);
        
        // Log start of test
        test.get().log(Status.INFO, "Starting Test Case: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        test.get().log(Status.PASS, "Test Case: '" + result.getMethod().getMethodName() + "()' PASSED");
        
        // Capture and attach screenshot
        WebDriver driver = getDriver(result);
        if (driver != null) {
            try {
                String screenshotPath = captureScreenshot(driver, result.getMethod().getMethodName());
                test.get().pass("Success Screenshot:", MediaEntityBuilder.createScreenCaptureFromPath(screenshotPath).build());
            } catch (Exception e) {
                test.get().log(Status.WARNING, "Failed to capture screenshot: " + e.getMessage());
            }
        }
    }

    @Override
    public void onTestFailure(ITestResult result) {
        test.get().log(Status.FAIL, "Test Case: '" + result.getMethod().getMethodName() + "()' FAILED");
        test.get().log(Status.FAIL, result.getThrowable());

        // Capture and attach screenshot
        WebDriver driver = getDriver(result);
        if (driver != null) {
            try {
                String screenshotPath = captureScreenshot(driver, result.getMethod().getMethodName());
                test.get().fail("Failure Screenshot:", MediaEntityBuilder.createScreenCaptureFromPath(screenshotPath).build());
            } catch (Exception e) {
                test.get().log(Status.WARNING, "Failed to capture screenshot: " + e.getMessage());
            }
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        test.get().log(Status.SKIP, "Test Case: '" + result.getMethod().getMethodName() + "()' SKIPPED");
    }

    @Override
    public void onFinish(ITestContext context) {
        if (extent != null) {
            extent.flush();
        }
    }

    public static void log(Status status, String details) {
        if (test.get() != null) {
            test.get().log(status, details);
        }
    }

    private WebDriver getDriver(ITestResult result) {
        // Retrieve driver from test context
        Object driverObj = result.getTestContext().getAttribute("WebDriver");
        if (driverObj instanceof WebDriver) {
            return (WebDriver) driverObj;
        }
        return null;
    }

    private String captureScreenshot(WebDriver driver, String screenshotName) {
        String dateName = new SimpleDateFormat("yyyyMMddhhmmss").format(new Date());
        TakesScreenshot ts = (TakesScreenshot) driver;
        File source = ts.getScreenshotAs(OutputType.FILE);
        
        String destinationDir = System.getProperty("user.dir") + "/target/extent-reports/screenshots/";
        File dir = new File(destinationDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        String destination = destinationDir + screenshotName + "_" + dateName + ".png";
        File finalDestination = new File(destination);
        try {
            Files.copy(source.toPath(), finalDestination.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        // Return relative path for report embedding
        return "screenshots/" + screenshotName + "_" + dateName + ".png";
    }
}
